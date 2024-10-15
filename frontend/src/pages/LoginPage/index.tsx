import axios from 'axios';
import { useState } from 'react';
import { Button, Form, Input, Message } from 'semantic-ui-react';
import './style.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: { preventDefault: () => void; }) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);
    setError('');

    axios.post('http://localhost:3000/api/auth/login', {
      email,
      password
    })
    .then(response => {
        if (response?.data) {
            localStorage.setItem('token', response.data);
        }
    })
    .catch(error => {
      console.error('Login error:', error);
      setError('Login failed. Please check your credentials.');
    })
    .finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className='container'>
      <div className="form-container">
        <Form onSubmit={handleLogin}>
          <Form.Field>
            <Input
              focus
              placeholder='Email'
              type='email'
              icon={'mail'}
              iconPosition='left'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Field>
          <Form.Field>
            <Input
              focus
              placeholder='Password'
              type='password'
              icon={'lock'}
              iconPosition='left'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Field>
          {error && <Message negative>{error}</Message>} 
          <Button className='ui primary btn login-btn' loading={loading} type='submit'>Login</Button>
        </Form>
      </div>
    </div>
  );
}

export default LoginPage;