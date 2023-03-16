import React from "react";
import { Form, Input, Button, Space } from "antd";
import axios from "axios";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
const API_KEY = import.meta.env.VITE_API_KEY;

// layout from antd
const Register = (props) => {
  // register user
  const registerUser = async (values) => {
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
          props.setLoginOpen(false);
        }
      })
      .catch((err) => {
        alert("Username Taken!");
      });
  };

  const backToLogin = () => {
    props.setModalTitle("Login");
    props.setRegisterOpen(false);
  };

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
          <Input
            maxLength={16}
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Username"
            autoComplete="off"
          />
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
                  new Error("The two passwords that you entered do not match!")
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
              Register
            </Button>
            <Button type="default" onClick={backToLogin}>
              Back to Login
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </>
  );
};

export default Register;
