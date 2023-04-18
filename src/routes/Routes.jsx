import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  RequireAuth,
  useAuthUser,
  useSignOut,
  useIsAuthenticated,
} from "react-auth-kit";
import { SettingOutlined } from "@ant-design/icons";
import Login from "../login/Login";
import Dashboard from "../dashboard/Dashboard";
import Register from "../login/Register";
import { Layout, Form, Input, Button, Modal } from "antd";
import AccountSettings from "../dashboard/AccountSettings";

const { Header, Content, Footer } = Layout;

export const RouteComponent = () => {
  const [pageName, setPageName] = useState("");
  const auth = useAuthUser();
  const isAithenticated = useIsAuthenticated();
  const signOut = useSignOut();

  return (
    <Layout>
      <Header style={{ backgroundColor: "#722ED1", color: "#fff" }}>
        <h1 style={{ margin: "0", display: "inline" }}>{pageName}</h1>
        {isAithenticated() && (
          <div
            style={{ position: "absolute", display: "inline", right: "100px" }}
          >
            <h3 style={{ display: "inline" }}>{auth().username}</h3>{" "}
            <AccountSettings />
            <a
              onClick={() => {
                signOut();
              }}
              style={{ padding: "5px" }}
            >
              Logout
            </a>
          </div>
        )}
      </Header>
      <Content style={{ backgroundColor: "#282c34", padding: "50px 50px" }}>
        <BrowserRouter>
          <Routes>
            <Route
              path={"/login"}
              element={<Login setPageName={setPageName} />}
            />
            <Route
              path={"/register"}
              element={<Register setPageName={setPageName} />}
            />
            <Route
              path={"/"}
              element={
                <RequireAuth loginPath={"/login"}>
                  <Dashboard setPageName={setPageName} />
                </RequireAuth>
              }
            />
          </Routes>
        </BrowserRouter>
      </Content>
      <Footer
        className="footer"
        style={{ backgroundColor: "#722ED1", color: "#fff" }}
      >
        Security App ©2023 Created by Bradley Norman
      </Footer>
    </Layout>
  );
};
