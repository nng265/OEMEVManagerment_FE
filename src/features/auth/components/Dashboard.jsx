import { useAuth } from '../../../context/AuthContext';
import './Dashboard.css';


const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <h1>Welcome to Dashboard</h1>
      <p>Hello, {user?.username}!</p>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Vehicles</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Active Warranties</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Pending Claims</h3>
          <p className="stat-value">0</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;