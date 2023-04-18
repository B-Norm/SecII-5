import React, { useState } from "react";
import { Card, Button, Row, Col, Modal, Space } from "antd";
import Crypto from "./Crypto";

const FileDisplay = (filename, file) => {
  const url =
    "data:" +
    file.contentType +
    ";base64," +
    btoa(String.fromCharCode(...new Uint8Array(file.data.data)));

  const fileType = filename.split(".").pop();

  if (fileType === "jpg" || fileType === "png" || fileType === "gif") {
    // If the file is an image, display it using an img tag
    return <img src={url} alt={filename} />;
  } else if (fileType === "mp4") {
    // If the file is a video, display it using a video tag
    return (
      <video controls>
        <source src={url} type="video/mp4" />
      </video>
    );
  } else if (fileType === "mp3") {
    return (
      <audio controls>
        <source src={url} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    );
  } else {
    // If the file type is not supported, display an error message
    return (
      <p>
        !!Unsupported file type: {fileType}!! {filename}{" "}
      </p>
    );
  }
};

const Images = (props) => {
  const [display, setDisplay] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const handleOpenDisplay = (file) => {
    setSelectedCard(file);
  };
  const handleCancelDisplay = () => {
    props.getFiles();
    setSelectedCard(null);
  };
  const columnCount = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  };

  const downloadFile = (file) => {
    const url =
      "data:" +
      file.file.contentType +
      ";base64," +
      btoa(String.fromCharCode(...new Uint8Array(file.file.data.data)));
    const link = document.createElement("a");
    link.href = url;
    link.download = file.filename;
    link.click();
    link.remove();
    props.getFiles();
    setSelectedCard(null);
  };

  return (
    <>
      {" "}
      <Row gutter={[16, 16]}>
        {props.files?.map((file, i) => (
          <Col key={i} /* span={24 / columnCount} */>
            <Card
              key={i}
              style={{ width: 300, marginTop: 16 }}
              cover={file && FileDisplay(file.filename, file.file)}
              number={i}
            >
              <Space>
                <Button
                  onClick={() => {
                    handleOpenDisplay(file);
                  }}
                >
                  {!file.encrypted ? "Encrypt File" : "Decrypt File"}
                </Button>
                <Button onClick={() => downloadFile(file)}>
                  Download File
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
        {selectedCard && (
          <Modal
            title={!selectedCard.encrypted ? "Encrypt" : "Decrypt"}
            open={selectedCard}
            destroyOnClose={true}
            onCancel={handleCancelDisplay}
            afterClose={props.getFiles}
            footer={[]}
          >
            <Crypto
              file={selectedCard}
              getFiles={props.getFiles}
              setSelectedCard={setSelectedCard}
              handleCancelDisplay={handleCancelDisplay}
            />
          </Modal>
        )}
      </Row>
    </>
  );
};

export default Images;
