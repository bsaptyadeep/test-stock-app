// A utility function to connect to a WebSocket and handle incoming messages
export const connectToWebSocket = (
    url: string, // WebSocket URL
    onMessage: (data: any) => void, // Callback to handle incoming messages
    onError?: (error: any) => void, // Optional callback to handle errors
    onClose?: (event: CloseEvent) => void, // Optional callback to handle WebSocket closing
    onOpen?: (event: Event) => void // Optional callback for WebSocket opening
  ): WebSocket => {
    const socket = new WebSocket(url);
  
    // Event handler for WebSocket connection open
    socket.onopen = (event: Event) => {
      console.log('WebSocket connection opened:', url);
      if (onOpen) {
        onOpen(event);
      }
    };
  
    // Event handler for receiving messages
    socket.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data); // Assuming the data is in JSON format
      console.log('Received message from WebSocket:', data);
      onMessage(data); // Call the onMessage callback
    };
  
    // Event handler for errors
    socket.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      if (onError) {
        onError(error);
      }
    };
  
    // Event handler for closing the connection
    socket.onclose = (event: CloseEvent) => {
      console.log('WebSocket connection closed:', event);
      if (onClose) {
        onClose(event);
      }
    };
  
    return socket;
  };
  