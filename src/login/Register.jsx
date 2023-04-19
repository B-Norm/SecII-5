import React, { useEffect, useState } from "react";
import { Form, Input, Button, Space, message, Spin, Skeleton } from "antd";
import axios from "axios";
import forge from "node-forge";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
const API_KEY = import.meta.env.VITE_API_KEY;

// layout from antd
const Register = (props) => {
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  // User added create keys
  const success = async (values) => {
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
      element.download = values.username + "_private_key.pem";
      document.body.appendChild(element);
      element.click();
      setLoading(false);
    } catch (err) {
      message.error("Failed to Create New Public/ Private Key");
      console.error(err);
      setLoading(false);
    }

    //const strPub = JSON.stringify({ publicKey });

    const response = await axios("/api/keys/storePub", {
      method: "POST",
      headers: { "content-type": "application/json", api_key: API_KEY },
      data: { username: values.username, publicKey: publicKey },
    })
      .then((res) => {
        if (res.status === 200) {
          console.log("Keys Created");
          setLoading(false);
          message.success("User Added");
        }
      })
      .catch((err) => {
        message.error("Failed to Create New Public/ Private Key");
        setLoading(false);
        console.error(err);
      });
  };

  // buffer for key pair loader
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

  // username taken
  const error = () => {
    message.error("Username taken!!");
  };

  // register user
  const registerUser = async (values) => {
    try {
      const url = "/api/register";
      const { username, password } = values;

      const options = {
        method: "POST",
        headers: {
          "content-type": "application/json",
          api_key: API_KEY,
        },
        data: {
          username: username,
          password: password,
        },
        url: url,
      };

      const res = await axios(options)
        .then((response) => {
          if (response.status === 200) {
            setLoading(true);

            success(values).then(() => {
              setLoading(false);
              backToLogin();
            });
          }
        })
        .catch((err) => {
          error();
        });
    } catch (err) {
      console.log(err);
    }
  };

  const backToLogin = () => {
    nav("/login");
  };

  // change name
  useEffect(() => {
    props.setPageName("Register");
  });

  return (
    <>
      <Form
        name="normal_register"
        className="register-form"
        initialValues={{
          remember: true,
        }}
        onFinish={registerUser}
      >
        <Form.Item
          name="username"
          rules={[
            {
              required: true,
              message: "Please input your Username!",
            },
          ]}
        >
          {loading ? ( // conditionally render Skeleton component when form is submitted
            <Skeleton.Input active />
          ) : (
            <Input
              maxLength={16}
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Username"
              autoComplete="off"
            />
          )}
        </Form.Item>

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
          {loading ? ( // conditionally render Skeleton component when form is submitted
            <Skeleton.Input active />
          ) : (
            <Input.Password
              maxLength={16}
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Password"
            />
          )}
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
                  new Error("The two passwords that you entered do not match!")
                );
              },
            }),
          ]}
        >
          {loading ? ( // conditionally render Skeleton component when form is submitted
            <Skeleton.Input active />
          ) : (
            <Input.Password
              maxLength={16}
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Confirm Password"
            />
          )}
        </Form.Item>
        <Form.Item>
          <Space wrap>
            <Button type="primary" htmlType="submit" loading={loading}>
              Register
            </Button>
            <Button type="default" onClick={backToLogin}>
              Back to Login
            </Button>
            {loading && <Spin />}
          </Space>
        </Form.Item>
      </Form>
    </>
  );
};

export default Register;
