import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  useAuthHeader,
  useAuthUser,
  useIsAuthenticated,
  useSignOut,
} from "react-auth-kit";
import { SettingOutlined, UserOutlined } from "@ant-design/icons";
import {
  Form,
  Input,
  Button,
  message,
  Space,
  Modal,
  Divider,
  Spin,
  Cascader,
} from "antd";
import forge from "node-forge";

// settings for changing password and updating Pub/ Pri keys if time
const AccountSettings = () => {
  const [display, setDisplay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  const isAuthenticated = useIsAuthenticated();
  const useAuth = useAuthHeader();
  const auth = useAuthUser();
  const signOut = useSignOut();
  const nav = useNavigate();

  const handleOpenDisplay = () => {
    setDisplay(true);
  };
  const handleCancelDisplay = () => {
    setDisplay(false);
  };
  // updates user's password and addes new pass to database
  const updatePassword = async (values) => {
    const url = "/api/users/updatePassword";
    const password = values.password;

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: useAuth(),
      },
      data: {
        username: auth().username,
        password,
      },
      url: url,
    };

    await axios(options)
      .then((res) => {
        if (res.status === 200) {
          message.success("Password Updated");
          handleCancelDisplay();
        }
      })
      .catch((err) => {
        message.error("Failed to Update Password");
      });
  };

  const getUsers = async () => {
    if (!isAuthenticated()) {
      nav("/login");
    }
    let url = "/api/users/getUsers";

    let options = {
      method: "GET",
      headers: {
        "content-type": "application/json",
        authorization: useAuth(),
      },
      url: url,
    };

    const res = await axios(options)
      .then((response) => {
        if (response.status === 200) {
          setUsers(response.data);
        }
      })
      .catch((err) => {
        message.error("Failed to load users");
        console.log(err);
      });
  };

  const deleteUser = async (value) => {
    const url = "/api/users/deleteUser";

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: useAuth(),
      },
      data: {
        username: value,
      },
      url: url,
    };

    await axios(options)
      .then((res) => {
        if (res.status === 200) {
          message.success("User Deleted");
          handleCancelDisplay();
          if (value === auth().username) {
            signOut();
          }
        }
      })
      .catch((err) => {
        message.error("Failed to delete user");
        console.error(err);
      });
  };

  const updateUsers = (value) => {
    for (let i = 0; i < users.length; i++) {
      if (users[i].username == value) {
        setUser(users[i].username);
        break;
      }
    }
  };

  // creates new public/ private key pair and adds to database
  const createNewKeyPair = async () => {
    setLoading(true);

    const url = "/api/users/createNewKeyPair";
    message.success("Creating New Public/ Private Key");

    let keys, privateKey, publicKey;
    try {
      // create key pair
      keys = await generateKeyPair();

      privateKey = forge.pki.privateKeyToPem(keys.privateKey);
      publicKey = forge.pki.publicKeyToPem(keys.publicKey);

      // Download private key
      const element = document.createElement("a");
      const file = new Blob([privateKey], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = auth().username + "_private_key.pem";
      document.body.appendChild(element);
      element.click();
      setLoading(false);
    } catch (err) {
      message.error("Failed to Create New Public/ Private Key");
      setLoading(false);
    }

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: useAuth(),
      },
      data: {
        username: auth().username,
        publicKey,
      },
      url: url,
    };

    await axios(options)
      .then((res) => {
        if (res.status === 200) {
          message.success("New Public/ Private Key Created");
        }
      })
      .catch((err) => {
        message.error("Failed to Create New Public/ Private Key");
      });
  };

  const generateKeyPair = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const keys = forge.pki.rsa.generateKeyPair(2048);
          resolve(keys);
        } catch (error) {
          reject(error);
        }
      }, 0);
    });
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <>
      <button onClick={handleOpenDisplay}>
        <SettingOutlined />
      </button>

      <Modal
        title={<h3>Update Password</h3>}
        open={display}
        destroyOnClose={true}
        onCancel={handleCancelDisplay}
        footer={[]}
      >
        <Form
          name="Update Password"
          className="password-form"
          initialValues={{
            remember: true,
          }}
          onFinish={updatePassword}
        >
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
            ]}
            hasFeedback
          >
            <Input.Password
              maxLength={16}
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={["password"]}
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please confirm your password!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "The two passwords that you entered do not match!"
                    )
                  );
                },
              }),
            ]}
          >
            <Input.Password
              maxLength={16}
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Confirm Password"
            />
          </Form.Item>

          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit">
                Update Password
              </Button>
            </Space>
          </Form.Item>
        </Form>
        <Divider />
        <Button type="primary" onClick={createNewKeyPair}>
          Create new Public/ Private Key
        </Button>
        {loading && <Spin />}
        {auth().admin ? (
          <>
            <Divider />
            <h3>Select a user to delete</h3>
            <Cascader
              fieldNames={{
                label: "username",
                value: "username",
              }}
              options={users}
              onChange={updateUsers}
            />
            <Button
              onClick={() => {
                if (user) {
                  deleteUser(user);
                } else {
                  message.error("Failed to delete user");
                }
              }}
            >
              Delete User
            </Button>
          </>
        ) : (
          <Button
            onClick={() => {
              deleteUser(auth().username);
            }}
          >
            Delete Account
          </Button>
        )}
      </Modal>
    </>
  );
};

export default AccountSettings;
