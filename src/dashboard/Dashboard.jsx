import { useEffect, useState } from "react";
// using code from antd
import { UploadOutlined } from "@ant-design/icons";
import { Button, Space, Layout, Upload, Modal, message, Input } from "antd";
import { useIsAuthenticated, useAuthHeader, useSignOut } from "react-auth-kit";
import Images from "./Images";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_KEY = import.meta.env.VITE_API_KEY;

// TODO: add files file options to enrypt with AES and Asymmetric
// Maybe let users send files to other's by their public/private keys
// Also reset passwords

// convert to binary
const convertBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    fileReader.onload = () => {
      resolve(fileReader.result);
    };

    fileReader.onerror = (err) => {
      reject(err);
    };
  });
};

const App = (props) => {
  const isAuthenticated = useIsAuthenticated();
  const nav = useNavigate();
  const useAuth = useAuthHeader();
  const signOut = useSignOut();
  const [file, setFile] = useState([]);
  const [files, setFiles] = useState([]);
  const [submited, setSubmited] = useState(false);

  // Upload files
  const uploadFiles = async () => {
    if (!isAuthenticated()) {
      nav("/login");
    }
    const url = "/api/upload";
    //const base64 = await convertBase64(file);
    if (!submited) {
      message.error("No File Selected.");
      return;
    }
    const formData = new FormData();
    formData.append("filename", file.name);
    //formData.append("file", base64);
    formData.append("file", file);

    const options = {
      method: "POST",
      headers: {
        "content-type": "multipart/form-data",
        authorization: useAuth(),
      },
      data: formData,
      url: url,
    };

    const res = await axios(options)
      .then((response) => {
        if (response.status === 200) {
          message.success("File Uploaded");
          setFile([]);
          getFiles();
          setSubmited(false);
          document.getElementById("form").reset();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Show files for encypting and checking hashes
  const getFiles = async () => {
    if (!isAuthenticated()) {
      nav("/login");
    }
    const url = "/api/getFiles";

    const options = {
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
          //console.log(response.data);
          setFiles(response.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deleteAll = async () => {
    const url = "/api/deleteAllFiles";

    const options = {
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
          console.log("deleted");
          getFiles();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    props.setPageName("Dashboard");
    getFiles();
  }, []);

  return (
    <div>
      {/* <Upload
        beforeUpload={(file) => {
          console.log(file);
          return false;
        }}
        onChange={(info) => setFile(info.file)}
      >
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
      </Upload> */}
      <form id="form" noValidate>
        <input
          type="file"
          name="File"
          required
          onChange={(e) => {
            setFile(e.target.files[0]);
            setSubmited(true);
          }}
        />
        <Button onClick={uploadFiles}> Upload</Button>
      </form>
      <button onClick={deleteAll}> Delete all</button>
      <Images files={files} getFiles={getFiles} />
    </div>
  );
};
export default App;
