import { Button, Form, Input, Space } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useSignIn } from "react-auth-kit";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const API_KEY = import.meta.env.VITE_API_KEY;

//layout from antd
const Login = (props) => {
  const signIn = useSignIn();
  const nav = useNavigate();

  // log user in
  const onFinish = async (values) => {
    const url = "/api/login";
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
          signIn({
            token: response.data.token,
            expiresIn: 60,
            tokenType: "Bearer",
            authState: {
              username: values.username,
              SERVER_PUBLIC_KEY: response.data.SERVER_PUBLIC_KEY,
              admin: response.data.admin,
            },
          });
          nav("/");
        }
      })
      .catch((err) => {
        alert("Wrong Login Info!");
      });
  };

  useEffect(() => {
    props.setPageName("Login");
  }, []);

  return (
    <>
      <Form
        name="normal_login"
        className="login-form"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        style={{
          maxWidth: 600,
        }}
        initialValues={{
          remember: false,
        }}
        onFinish={onFinish}
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
              message: "Please input your Password!",
            },
          ]}
        >
          <Input
            maxLength={16}
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item>
          <Space wrap>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
            >
              Log in
            </Button>
            <Button type="default" onClick={() => nav("/register")}>
              {" "}
              Register
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </>
  );
};
export default Login;
