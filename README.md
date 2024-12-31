# Bunagram Real-Time Messaging Application

## Overview
This project is a **real-time messaging application** built using **Socket.IO** for WebSocket-based communication. The application enables users to send and receive messages instantly, whether in direct chats, group chats, or through broadcast messages. The backend is built with **Node.js** and **Express**, and the frontend uses modern web technologies to ensure an intuitive user experience. The system supports features such as user authentication, dynamic online user tracking, and secure message transmission with decryption.

---

## Features

### Backend
1. **Socket.IO Integration**: Enables real-time communication between the server and connected clients.
2. **User Connection Management**:
   - Tracks online users via a `userSocketMap`.
   - Updates online user lists dynamically on connection and disconnection events.
3. **Room-Based Communication**:
   - Allows users to join and leave group chat rooms dynamically.
   - Supports broadcasting messages within specific rooms.
4. **Broadcast Messaging**:
   - Sends messages to all connected users except the sender.
5. **Secure Messaging**:
   - Decrypts messages on the client side using user-specific private keys.
6. **Cross-Origin Resource Sharing (CORS)**:
   - Configured to allow secure communication with the frontend client hosted on a different domain.

### Frontend
1. **Dynamic User Interface**:
   - Displays online users dynamically.
   - Updates messages in real time.
2. **Socket Connection Handling**:
   - Initializes a connection with the backend using Socket.IO.
   - Listens for events like `newMessage`, `joinedGroup`, and `getOnlineUsers`.
3. **Message Decryption**:
   - Securely decrypts encrypted messages before displaying them in the chat.
4. **Group Messaging**:
   - Users can join and leave group chats.
   - Handles group-specific message broadcasting.
5. **Broadcast Messages**:
   - Allows sending global messages to all users while ensuring secure delivery.

---

## Technologies Used

### Backend
- **Node.js**: JavaScript runtime for server-side logic.
- **Express**: Framework for HTTP server handling.
- **Socket.IO**: Real-time bidirectional communication.
- **mongoDb**: a NoSQL database to store data.
- 

### Frontend
- **React.js**: Frontend library for building the user interface.
- **State Management**:
  - **Zustand**: Manages the application state for socket connections and user data.
  - **TailswindCSS**: for futuristic styles and design.
  - 

### Additional Libraries
- **Encryption Library**: (Custom implementation or an existing library) used to encrypt and decrypt messages for secure communication.

---

## Application Workflow

### Backend
1. **User Connection**:
   - Users connect to the server with their unique `userId`.
   - The `userSocketMap` maps `userId` to their corresponding `socket.id`.
2. **Event Handling**:
   - `getOnlineUsers`: Broadcasts the list of all online users to connected clients.
   - `joinRoom` and `leaveRoom`: Allows users to join or leave group chat rooms.
   - `groupMessage`: Sends messages within a specific group.
   - `Broadcast message`: Sends messages to all users except the sender.
3. **Disconnection**:
   - Removes the user's `socket.id` from `userSocketMap`.
   - Broadcasts an updated online user list.

### Frontend
1. **Socket Connection**:
   - Establishes a connection using the `connectSocket` function.
   - Initializes listeners for events like `newMessage`, `joinedGroup`, and `getOnlineUsers`.
2. **Message Handling**:
   - Listens for new messages.
   - Decrypt the message using the recipient's private key.
   - Updates the chat interface dynamically.
3. **Group Management**:
   - Joins and leaves rooms based on user actions.
   - Displays group-specific messages.
4. **Broadcast Handling**:
   - Processes and displays broadcast messages for relevant users.

---

## Installation and Setup

### Prerequisites
1. **Node.js** (version 16+)
2. **npm** or **yarn**
3. A modern web browser (e.g., Chrome, Firefox)

### Steps

#### Backend
1. Clone the repository:
   ```bash
   git clone https://github.com/MAHI-HAKIM/Bunagram/
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set environment variables:
   - Create a `.env` file.
   - Add the `CLIENT_URL` for the frontend application.
4. Start the server:
   ```bash
   npm run dev
   ```

#### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

---

## UML Diagram

Below is a simplified UML diagram illustrating the interaction between components in the application:

![UML Diagram](https://github.com/MAHI-HAKIM/Bunagram/blob/main/docs/UML.png)

---

## Screenshots

### Signup Page
![Application Screenshots](https://github.com/MAHI-HAKIM/Bunagram/blob/main/docs/singupPage.png)
### Chats Page
![Application Screenshots](https://github.com/MAHI-HAKIM/Bunagram/blob/main/docs/chats.png)
### Chats Container 
![Application Screenshots](https://github.com/MAHI-HAKIM/Bunagram/blob/main/docs/chatcontainer.png)

---



## Conclusion
This project demonstrates a robust implementation of real-time messaging with Socket.IO. By integrating secure messaging, dynamic user management, and group communication, it offers a foundation for building scalable and user-friendly communication platforms.

