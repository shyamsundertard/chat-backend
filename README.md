# Real-Time Chat Application Backend

This is the backend repository for a real-time chat application built with Strapi that supports WebSocket communication for instant messaging.

## Website: https://quick-ping.vercel.app/QuickPing

## Features

### Socket.IO Integration
- Real-time bidirectional communication using Socket.IO
- CORS configuration for secure cross-origin requests
- Event-based message handling
- Automatic reconnection management

### User Management
- Username retrieval functionality
- User authentication integration with Strapi's users-permissions plugin
- User verification before chat operations

### Chat Session Management
- Create new chat sessions with custom titles
- List all chat sessions for a specific user
- Sort sessions by most recently updated
- Automatic session joining upon creation
- Session selection capability

### Message Handling
- Real-time message exchange between user and system
- Timestamp tracking for all messages
- Message history retrieval for each chat session
- Automatic system response to user messages (echo functionality)
- Welcome messages for new chat sessions

### Room-Based Communication
- Socket room functionality for organizing conversations
- Join specific chat rooms based on session ID
- Isolated message broadcasting within rooms
- Session-specific message delivery

### Error Handling
- Comprehensive error checking for missing parameters
- Graceful error handling with detailed logging
- Socket error event monitoring

### Data Persistence
- Integration with Strapi entity service
- Storage of user information, chat sessions, and messages
- Automatic timestamp updates for session activity
- Sorting and filtering capabilities for data retrieval
