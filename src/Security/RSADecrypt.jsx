import React, { useState } from "react";
import { Upload, message, Button } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import forge from "node-forge";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthHeader, useAuthUser, useIsAuthenticated } from "react-auth-kit";

const { Dragger } = Upload;

const RSADecrypt = (props) => {
  const [pemString, setPemString] = useState("");
  const [fileUploaded, setFileUploaded] = useState(false);
  const nav = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const useAuth = useAuthHeader();
  const auth = useAuthUser();

  const handlePemUpload = async (file) => {
    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
      const privateKey = forge.pki.privateKeyFromPem(e.target.result);
      setPemString(forge.pki.privateKeyToPem(privateKey));
      setFileUploaded(true);
    };
    fileReader.readAsText(file);
  };

  const draggerProps = {
    name: "file",
    showUploadList: false,
    customRequest: (options) => {
      const formData = new FormData();
      formData.append("file", options.file);
      const fileExtension = options.file.name.split(".").pop();
      if (fileExtension !== "pem") {
        message.error("You can only upload PEM files!");
        return;
      }
      handlePemUpload(options.file);
      options.onSuccess();
    },
  };

  const decryptFile = async (value) => {
    setFileUploaded(false);

    if (!isAuthenticated()) {
      nav("/login");
    }

    let url = "/api/RSA/decrypt";

    const buffer = btoa(
      String.fromCharCode(...new Uint8Array(props.file.file.data.data))
    );
    const encryptedBuffer = forge.util.decode64(buffer);
    // Parse the public key string into a Forge public key object
    const privateKeyObject = forge.pki.privateKeyFromPem(pemString);

    // Encrypt the input buffer using the public key
    let decryptedBuffer;
    try {
      decryptedBuffer = privateKeyObject.decrypt(encryptedBuffer);
    } catch {
      message.error("Wrong Key");
    }
    if (value === 1) {
      const options = {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: useAuth(),
        },
        data: {
          file: decryptedBuffer,
          fileID: props.file._id,
        },
        url: url,
      };

      const res = await axios(options)
        .then((response) => {
          if (response.status === 200) {
            message.success("File Decrypted by with RSA");
            props.setSelectedCard(null);
            props.handleCancelDisplay();
          }
        })
        .catch((err) => {
          message.error("Wrong Key");
          console.log(err);
        });
    } else {
      // Download Decrypted file
      const url =
        "data:" + props.file.file.contentType + ";base64," + decryptedBuffer;

      event.preventDefault();
      const link = document.createElement("a");
      link.href = url;
      link.download = props.file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div>
      <Dragger {...draggerProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">Please upload a PEM file.</p>
        {fileUploaded && <h1 className="ant-upload-hint">File added</h1>}
      </Dragger>
      {fileUploaded && (
        <>
          <Button
            onClick={() => {
              decryptFile(1);
            }}
          >
            Submit
          </Button>
          <Button onClick={() => decryptFile(2)}>
            Download Decrypted File
          </Button>
        </>
      )}
    </div>
  );
};

export default RSADecrypt;
