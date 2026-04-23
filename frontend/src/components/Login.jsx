import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) { alert(err.response?.data?.message || 'Invalid login credentials'); }
  };

  return (
    <div className="container center-screen">
      <div className="card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" required onChange={e => setForm({...form, email: e.target.value})} />
          <input type="password" placeholder="Password" required onChange={e => setForm({...form, password: e.target.value})} />
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
        <p>No account? <Link to="/">Register</Link></p>
      </div>
    </div>
  );
}