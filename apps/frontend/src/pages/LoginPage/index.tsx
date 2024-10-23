import axios from 'axios';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Header, Input, Message, Segment } from 'semantic-ui-react';
import { AUTH_URL } from '../../routes';
import './style.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const token = useMemo(() => localStorage.getItem('token'), []);

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${AUTH_URL}`, {
        email,
        password
      });
      const userData = JSON.stringify(response?.data);
      localStorage.setItem('token', userData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-page'>
      <div className='fixed-header'>
        <Header as='h1' textAlign='center' style={{ color: '#ffffff' }}>
          Welcome to Our Application
        </Header>
      </div>
      <div className='login-container'>
        <Segment raised style={{ maxWidth: '400px', margin: 'auto', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          <Header as='h2' textAlign='center' style={{ marginBottom: '2rem', color: '#4CAF50' }}>
            Login to Your Account
          </Header>
          <Form onSubmit={handleLogin}>
            <Form.Field>
              <Input
                ref={emailRef}
                focus
                placeholder='Email'
                type='email'
                icon='mail'
                iconPosition='left'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginBottom: '1rem', borderRadius: '5px' }}
              />
            </Form.Field>
            <Form.Field>
              <Input
                ref={passwordRef}
                focus
                placeholder='Password'
                type='password'
                icon='lock'
                iconPosition='left'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ marginBottom: '1rem', borderRadius: '5px' }}
              />
            </Form.Field>
            {error && <Message negative>{error}</Message>}
            <Button
              primary
              loading={loading}
              type='submit'
              style={{ width: '100%', borderRadius: '5px', fontSize: '1.1rem' }}
            >
              Submit
            </Button>
          </Form>
        </Segment>
      </div>
    </div>
  );
}

export default LoginPage;