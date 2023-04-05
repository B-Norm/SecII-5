import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RequireAuth } from "react-auth-kit";
import Login from "../login/Login";
import Dashboard from "../dashboard/Dashboard";
import Register from "../login/Register";
import { Layout, Form, Input, Button } from "antd";

const { Header, Content, Footer } = Layout;

export const RouteComponent = () => {
  const [pageName, setPageName] = useState("");

  return (
    <Layout>
      <Header style={{ backgroundColor: "#722ED1", color: "#fff" }}>
        <h1 style={{ margin: "0" }}>{pageName}</h1>
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
