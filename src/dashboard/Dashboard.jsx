import { useEffect, useState } from "react";
// using code from antd
import { Button, Space, Layout, Modal, theme, Input } from "antd";
import { useIsAuthenticated, useAuthUser, useSignOut } from "react-auth-kit";
import axios from "axios";

const { Header, Content, Footer } = Layout;
const API_KEY = import.meta.env.VITE_API_KEY;

// TODO: add files file options to enrypt with AES and Asymmetric
// Maybe let users send files to other's by their public/private keys
// Also reset passwords

const App = (props) => {
  // states for login button
  const isAuthenticated = useIsAuthenticated();
  const auth = useAuthUser();
  const signOut = useSignOut();

  const showLogin = () => {
    setLoginOpen(true);
  };
  const showUpload = () => {
    setUploadOpen(true);
  };
  const handleCancel = () => {
    setLoginOpen(false);
    setRegisterOpen(false);
    setModalTitle("Login");
  };
  const handleCancelUpload = () => {
    setUploadOpen(false);
  };

  const logout = () => {
    signOut();
  };
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const getFiles = async () => {
    const url = "/api/getFiles";

    const options = {
      method: "GET",
      headers: {
        "content-type": "application/json",
        api_key: API_KEY,
      },
      url: url,
    };

    const res = await axios(options)
      .then((response) => {
        if (response.status === 200) {
          setFiles(response.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    props.setPageName("Dashboard");
  }, [reload]);

  return <div>HEllo</div>;
};
export default App;
