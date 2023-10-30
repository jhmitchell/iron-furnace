import React from 'react';
import { useAuth } from '/src/features/authentication';

const TestPage = () => {
  const { user } = useAuth();
  
  return (
    <div>
      {user ? (
        <h1>Welcome, {user.username}!</h1>
      ) : (
        <h1>Please log in to view this content.</h1>
      )}
    </div>
  );
};

export default TestPage;
