import React, { Component } from 'react';

const styles = {
        container: {
                maxWidth: 400,
                margin: '50px auto',
                padding: 20,
                border: '2px solid #ddd',
                borderRadius: 8,
                backgroundColor: '#fafafa',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        },
        heading: {
                textAlign: 'center',
                color: '#333',
                marginBottom: 20,
        },
        fileInput: {
                display: 'block',
                margin: '0 auto 20px auto',
                cursor: 'pointer',
        },
        button: {
                display: 'block',
                width: '100%',
                padding: 10,
                backgroundColor: '#007bff',
                border: 'none',
                color: 'white',
                fontWeight: 'bold',
                fontSize: 16,
                borderRadius: 5,
                cursor: 'pointer',
                transition: 'background-color 0.25s ease',
        },
        buttonHover: {
                backgroundColor: '#0056b3',
        },
        status: {
                marginTop: 15,
                textAlign: 'center',
                fontWeight: 600,
                color: '#444',
        },
};

export default class UploadImg extends Component {
        constructor(props) {
                super(props);
                this.state = {
                        file: null,
                        uploadStatus: '',
                        isHover: false,
                };
        }

        handleFileChange = (event) => {
                this.setState({ file: event.target.files[0] });
        };

        handleUpload = async () => {
                const { file } = this.state;
                if (!file) {
                        alert('Please select a file first');
                        return;
                }

                const formData = new FormData();
                formData.append('image', file);

                try {
                        const response = await fetch('http://192.168.1.2:8080/moonlightcafe/v1/file/upload', {
                                method: 'POST',
                                body: formData,
                        });

                        if (response.ok) {
                                this.setState({ uploadStatus: 'Upload successful!' });
                        } else {
                                this.setState({ uploadStatus: 'Upload failed.' });
                        }
                } catch (error) {
                        console.error('Upload error:', error);
                        this.setState({ uploadStatus: 'Upload error.' });
                }
        };

        toggleHover = () => {
                this.setState((prev) => ({ isHover: !prev.isHover }));
        };

        render() {
                const { uploadStatus, isHover } = this.state;
                const buttonStyle = isHover
                        ? { ...styles.button, ...styles.buttonHover }
                        : styles.button;

                return (
                        <div style={styles.container}>
                                <h2 style={styles.heading}>Upload Image</h2>
                                <input
                                        type="file"
                                        onChange={this.handleFileChange}
                                        accept="image/*"
                                        style={styles.fileInput}
                                />
                                <button
                                        style={buttonStyle}
                                        onClick={this.handleUpload}
                                        onMouseEnter={this.toggleHover}
                                        onMouseLeave={this.toggleHover}
                                >
                                        Upload
                                </button>
                                <p style={styles.status}>{uploadStatus}</p>
                        </div>
                );
        }
}
