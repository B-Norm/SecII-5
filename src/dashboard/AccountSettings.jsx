import React, { useState } from "react";
import axios from "axios";
import { useAuthHeader, useAuthUser, useIsAuthenticated } from "react-auth-kit";
import { SettingOutlined, UserOutlined } from "@ant-design/icons";
import { Form, Input, Button, message, Space, Modal } from "antd";

// settings for changing password and updating Pub/ Pri keys if time
const AccountSettings = () => {
  const [display, setDisplay] = useState(false);

  const isAuthenticated = useIsAuthenticated();
  const useAuth = useAuthHeader();
  const auth = useAuthUser();

  const handleOpenDisplay = () => {
    setDisplay(true);
  };
  const handleCancelDisplay = () => {
    setDisplay(false);
  };

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
        }
      })
      .catch((err) => {
        message.error("Failed to Update Password");
      });
  };

  return (
    <>
      <button onClick={handleOpenDisplay}>
        <SettingOutlined />
      </button>

      <Modal
        title="Update Password"
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
      </Modal>
    </>
  );
};

export default AccountSettings;
