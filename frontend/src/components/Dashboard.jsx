import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ itemName: '', description: '', type: 'Lost', location: '', contactInfo: '' });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const fetchItems = async () => {
    try {
      const endpoint = search ? `/items/search?name=${search}` : '/items';
      const res = await api.get(endpoint);
      setItems(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchItems(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/items/${editingId}`, form);
        setEditingId(null);
      } else {
        await api.post('/items', form);
      }
      setForm({ itemName: '', description: '', type: 'Lost', location: '', contactInfo: '' });
      fetchItems();
    } catch (err) { alert('Action failed. You might not be authorized.'); }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm(item);
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/items/${id}`);
      fetchItems();
    } catch (err) { alert('Only the creator can delete this item.'); }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Campus Lost & Found</h1>
        <div>
          <span>Hi, {user.name} </span>
          <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </div>
      </header>

      <div className="card">
        <h3>{editingId ? 'Update Item' : 'Report an Item'}</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <input type="text" placeholder="Item Name" required value={form.itemName} onChange={e => setForm({...form, itemName: e.target.value})} />
          <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
          </select>
          <input type="text" placeholder="Location" required value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
          <input type="text" placeholder="Contact Info" required value={form.contactInfo} onChange={e => setForm({...form, contactInfo: e.target.value})} />
          <textarea placeholder="Description" required value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="full-width"></textarea>
          <button type="submit" className="btn btn-primary full-width">{editingId ? 'Update Item' : 'Submit Item'}</button>
        </form>
      </div>

      <div className="card">
        <input type="text" placeholder="Search items by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-bar" />
        
        <div className="item-list">
          {items.map(item => (
            <div key={item._id} className={`item-card ${item.type.toLowerCase()}`}>
              <div className="item-badge">{item.type}</div>
              <h4>{item.itemName}</h4>
              <p>{item.description}</p>
              <p><strong>Location:</strong> {item.location}</p>
              <p><strong>Contact:</strong> {item.contactInfo}</p>
              <small>{new Date(item.date).toLocaleDateString()}</small>
              
              {user.id === item.userId && (
                <div className="actions">
                  <button onClick={() => handleEdit(item)} className="btn btn-sm btn-primary">Edit</button>
                  <button onClick={() => handleDelete(item._id)} className="btn btn-sm btn-danger">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}