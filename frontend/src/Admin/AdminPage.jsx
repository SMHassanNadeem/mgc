import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  BarElement,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  BarElement,
);

export default function Chart() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalUsers: 0,
    totalRiders: 0,
    completedOrders: 0,
    canceledOrders: 0,
    monthlyEarnings: [],
    monthlyOrders: [],
    months: [],
    statusCounts: {},
    cityCounts: {}
  });

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      // Fetch orders
      const ordersResponse = await fetch('http://localhost:3000/orders/get-all-orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (ordersResponse.status === 401 || ordersResponse.status === 403) {
        localStorage.removeItem('token');
        navigate('/');
        return;
      }

      const ordersData = await ordersResponse.json();
      console.log('Orders Data:', ordersData); // Debug log
      const ordersArray = Array.isArray(ordersData) ? ordersData :
        ordersData || ordersData.data || [];
      setOrders(ordersArray);

      // Fetch users
      const usersResponse = await fetch('http://localhost:3000/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const usersData = await usersResponse.json();
      console.log('Users Data:', usersData); // Debug log
      const usersArray = Array.isArray(usersData) ? usersData :
        usersData.users || usersData.data || [];
      setUsers(usersArray);

      // Fetch riders
      const ridersResponse = await fetch('http://localhost:3000/riders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const ridersData = await ridersResponse.json();
      console.log('Riders Data:', ridersData); // Debug log
      const ridersArray = Array.isArray(ridersData) ? ridersData :
        ridersData.riders || ridersData.data || [];
      setRiders(ridersArray);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics whenever data changes
  useEffect(() => {
    if (orders.length > 0 || users.length > 0 || riders.length > 0) {
      calculateStats();
    }
  }, [orders, users, riders]);

  const calculateStats = () => {
    // Debug: Check what data we have
    console.log('Calculating stats with:', {
      ordersCount: orders.length,
      usersCount: users.length,
      ridersCount: riders.length
    });

    // If no data, return empty stats
    if (orders.length === 0 && users.length === 0 && riders.length === 0) {
      setStats({
        totalEarnings: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalUsers: 0,
        totalRiders: 0,
        completedOrders: 0,
        canceledOrders: 0,
        monthlyEarnings: [],
        monthlyOrders: [],
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        statusCounts: {},
        cityCounts: {}
      });
      return;
    }

    // 1. Calculate basic stats
    const totalEarnings = orders.filter(st => st?.status === "Order - Done").reduce((sum, order) =>
      sum + (parseFloat(order.OrderAmount) || 0), 0
    );

    const totalOrders = orders.length;
    const totalUsers = users.filter(us => us.status === "approved").length;
    const totalRiders = riders.length;

    // 2. Count orders by status - FIXED VERSION
    const pendingOrders = orders.filter(order => {
      const status = (order.status || '').toLowerCase();
      return status !== '' && status !== 'order - done' && status !== 'shipment - canceled';
    }).length;

    const completedOrders = orders.filter(order => {
      const status = (order.status || '').toLowerCase();
      return status === 'order - done';
    }).length;

    const canceledOrders = orders.filter(order => {
      const status = (order.status || '').toLowerCase();
      return status === 'shipment - canceled';
    }).length;

    // 3. Group orders by month
    const monthlyData = {};
    const monthlyOrders = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Get last 6 months
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.getMonth(); // 0-11
      last6Months.push(monthKey);
      monthlyData[monthKey] = 0;
      monthlyOrders[monthKey] = 0;
    }

    // Process orders
    orders.forEach(order => {    //.filter(st => st?.status === "Order - Done")
      if (order.OrderDate) {
        try {
          const orderDate = new Date(order.OrderDate);
          const month = orderDate.getMonth();
          const year = orderDate.getFullYear();
          const currentYear = new Date().getFullYear();

          // Only include current year orders
          if (year === currentYear && last6Months.includes(month)) {
            monthlyData[month] += (parseFloat(order.OrderAmount) || 0);
            monthlyOrders[month] += 1;
          }
        } catch (e) {
          console.error('Error parsing date:', order.OrderDate, e);
        }
      }
    });

    // Create arrays for charts
    const monthlyEarnings = last6Months.map(month => monthlyData[month] || 0);
    const monthlyOrderCounts = last6Months.map(month => monthlyOrders[month] || 0);
    const months = last6Months.map(month => monthNames[month]);

    // 4. Group orders by status for pie chart
    const statusCounts = {};
    orders.forEach(order => {
      const status = order.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // 5. Group orders by city
    const cityCounts = {};
    orders.forEach(order => {
      const city = order.DeliveryCity || order.PickupCity || 'Unknown';
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    setStats({
      totalEarnings,
      totalOrders,
      pendingOrders,
      totalUsers,
      totalRiders,
      completedOrders,
      canceledOrders,
      monthlyEarnings,
      monthlyOrders: monthlyOrderCounts,
      months,
      statusCounts,
      cityCounts
    });
  };

  // Line Chart Data (Earnings over last 6 months)
  const lineChartData = {
    labels: stats.months,
    datasets: [
      {
        label: "Earnings (Rs)",
        data: stats.monthlyEarnings,
        borderColor: "rgba(99, 102, 241, 1)",
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(99, 102, 241, 0.4)");
          gradient.addColorStop(1, "rgba(24, 24, 27, 0)");
          return gradient;
        },
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        borderWidth: 3,
      },
    ],
  };

  // Pie Chart Data (Orders by Status)
  const pieChartData = {
    labels: Object.keys(stats.statusCounts),
    datasets: [
      {
        label: "Orders",
        data: Object.values(stats.statusCounts),
        backgroundColor: [
          "rgba(99, 102, 241, 0.7)", // Indigo
          "rgba(16, 185, 129, 0.7)", // Green
          "rgba(245, 158, 11, 0.7)", // Yellow
          "rgba(239, 68, 68, 0.7)",  // Red
          "rgba(148, 163, 184, 0.7)", // Gray
          "rgba(168, 85, 247, 0.7)", // Purple
          "rgba(236, 72, 153, 0.7)", // Pink
          "rgba(56, 189, 248, 0.7)", // Blue
        ],
        borderColor: "transparent",
        borderWidth: 1,
      },
    ],
  };

  // Bar Chart Data (Orders per month)
  const barChartData = {
    labels: stats.months,
    datasets: [
      {
        label: "Orders",
        data: stats.monthlyOrders,
        backgroundColor: "#041026",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Chart Options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context) {
            return `Earnings: Rs ${context.raw.toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        grid: { display: false },
      },
      y: {
        display: true,
        grid: { display: true },
        beginAtZero: true,
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        grid: { display: false },
      },
      y: {
        display: true,
        grid: { display: true },
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="pt-5 flex items-center justify-center bg-gray-100 w-7/8! sm:w-3/4 h-screen">
        <div className="text-xl">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="pt-5 flex flex-col gap-3 bg-gray-100 w-7/8! sm:w-3/4 h-screen overflow-auto p-4">
      {/* Debug Info - Remove in production */}
      {/* <div className="bg-yellow-100 p-2 rounded mb-2 text-sm">
        <strong>Debug Info:</strong> Orders: {orders.length}, Users: {users.length}, Riders: {riders.length}
      </div> */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <i className="fas fa-sack-dollar text-green-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Cash Handled</p>
              <p className="text-2xl font-bold">Rs {stats.totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <i className="fas fa-cart-shopping text-blue-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="rounded-full bg-red-100 p-3 mr-4">
              <i className="fas fa-hourglass-half text-red-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Orders</p>
              <p className="text-2xl font-bold">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="rounded-full bg-orange-100 p-3 mr-4">
              <i className="fas fa-users text-orange-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Approved Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Earnings Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4 text-nowrap!">Monthly Cash Handled</h3>
          <div className="h-64">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
          <div className="h-64">
            {Object.keys(stats.statusCounts).length > 0 ? (
              <Pie data={pieChartData} options={pieChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No order status data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Orders */}
        <div className="bg-white rounded-lg shadow p-4 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Monthly Done Orders</h3>
          <div className="h-64">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="font-semibold mb-3">Order Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Completed:</span>
              <span className="font-bold text-green-600">{stats.completedOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending:</span>
              <span className="font-bold text-yellow-600">{stats.pendingOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Canceled:</span>
              <span className="font-bold text-red-600">{stats.canceledOrders}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="font-semibold mb-3">Platform Stats</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Riders:</span>
              <span className="font-bold">{stats.totalRiders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Users:</span>
              <span className="font-bold">{stats.totalUsers}</span>
            </div>
            {/* <div className="flex justify-between">
              <span className="text-gray-600">Avg Order Value:</span>
              <span className="font-bold">
                Rs {stats.totalOrders > 0 ? Math.round(stats.totalEarnings / stats.totalOrders).toLocaleString() : 0}
              </span>
            </div> */}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="font-semibold mb-3">Recent Activity</h4>
          <div className="text-sm">
            {stats.months.length > 0 ? (
              <>
                <p className="text-gray-600 mb-2">Last 6 months activity:</p>
                <ul className="space-y-1">
                  {stats.months.map((month, index) => (
                    <li key={month} className="flex justify-between">
                      <span>{month}:</span>
                      <span className="font-medium">
                        Rs {stats.monthlyEarnings[index]?.toLocaleString() || 0}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-gray-500">No recent activity data</p>
            )}
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-4">
        {/* <button
          onClick={fetchAllData}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center"
        >
          <i className="fas fa-sync-alt mr-2"></i>
          Refresh Data
        </button> */}
      </div>
    </div>
  );
}



// import {
//   Chart as ChartJS,
//   LineElement,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   ArcElement,
//   Tooltip,
//   Legend,
//   Filler,
//   BarElement,
// } from "chart.js";
// import { useEffect } from "react";
// import { Bar, Line, Pie } from "react-chartjs-2";

// ChartJS.register(
//   LineElement,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   ArcElement,
//   Tooltip,
//   Legend,
//   Filler,
//   BarElement,
// );

// export default function Chart() {

//   // useEffect(() => {
//   //   fetch("https://ipwhois.app/json/")
//   //     .then(res => res.json())
//   //     .then(data => console.log(data))
//   //     .catch(err => console.error(err));
//   // }, [])

//   const data = [
//     { date: "Jan", price: 500, status: "Pending", product: "Laptop", username: "Alice" },
//     { date: "Apr", price: 900, status: "Waiting", product: "Headphones", username: "Alice" },
//     { date: "Feb", price: 700, status: "Done", product: "Phone", username: "Bob" },
//     { date: "Jul", price: 850, status: "Pending", product: "Monitor", username: "Bob" },
//     { date: "Mar", price: 300, status: "Canceled", product: "Tablet", username: "Charlie" },
//     { date: "May", price: 400, status: "Pending", product: "Keyboard", username: "David" },
//     { date: "Jun", price: 650, status: "Pending", product: "Mouse", username: "Eve" },
//     { date: "Aug", price: 750, status: "Pending", product: "Charger", username: "Frank" },
//     { date: "Sep", price: 950, status: "Pending", product: "Camera", username: "Grace" },
//     { date: "Oct", price: 1000, status: "Pending", product: "Speaker", username: "Heidi" },
//   ];


//   const data1 = {
//     labels: data.map((item) => item.date),
//     datasets: [
//       {
//         label: "Earning",
//         data: data
//           .map((item) => item.price)
//           .reduce((acc, val) => {
//             const last = acc.length > 0 ? acc[acc.length - 1] : 0;
//             acc.push(last + val);
//             return acc;
//           }, []),
//         borderColor: "rgba(99, 102, 241, 1)",
//         backgroundColor: (context) => {
//           const ctx = context.chart.ctx;
//           const gradient = ctx.createLinearGradient(0, 0, 0, 400);
//           gradient.addColorStop(0, "rgba(99, 102, 241, 0.4)");
//           gradient.addColorStop(1, "rgba(24, 24, 27, 0)");
//           return gradient;
//         },
//         tension: 0.4,
//         fill: true,
//         pointRadius: 0,
//         borderWidth: 3,
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: { display: false },
//       tooltip: {
//         mode: "index",
//         intersect: false,
//       },
//     },
//     scales: {
//       x: {
//         display: false,
//         grid: { display: false },
//       },
//       y: {
//         display: false,
//         grid: { display: false },
//       },
//     },
//     elements: {
//       line: {
//         borderJoinStyle: "round",
//         borderCapStyle: "round",
//         shadowColor: "rgba(99, 102, 241, 0.5)",
//         shadowBlur: 12,
//         shadowOffsetY: 6,
//       },
//     },
//   };

//   const data2 = {
//     labels: data?.map((item) => item.product) || [],
//     datasets: [
//       {
//         label: "Users by Country",
//         data: data?.map((item) => item.price) || [],
//         backgroundColor: [
//           "rgba(24, 24, 27, 0.9)",   // near-black obsidian
//           "rgba(45, 52, 54, 0.8)",   // graphite grey
//           "rgba(99, 102, 241, 0.7)", // electric indigo
//           "rgba(56, 189, 248, 0.7)", // neon cyan
//           "rgba(16, 185, 129, 0.7)", // emerald teal
//           "rgba(245, 158, 11, 0.7)", // golden amber
//           "rgba(239, 68, 68, 0.7)",  // scarlet red
//           "rgba(168, 85, 247, 0.7)", // vivid violet
//           "rgba(236, 72, 153, 0.7)", // magenta rose
//           "rgba(148, 163, 184, 0.7)" // cool steel
//         ]
//         ,
//         borderColor: [
//           "transparent",
//         ],
//         borderWidth: 1,
//       },
//     ],
//   };

//   const options1 = {
//     responsive: true,
//     plugins: {
//       legend: { display: false },
//       tooltip: {
//         callbacks: {
//           label: function (ctx) {
//             let label = ctx.label || "";
//             let value = ctx.raw || 0;
//             return `${label}: ${value}`;
//           },
//         },
//       },
//     },
//   };

//   const cumulativePrices = data
//     .map(item => item.price)
//     .reduce((acc, val) => {
//       const last = acc.length ? acc[acc.length - 1] : 0;
//       acc.push(last + val);
//       return acc;
//     }, []);

//   const barData = {
//     labels: data.map(item => item.date),
//     datasets: [
//       {
//         label: "Earning",
//         data: cumulativePrices,
//         backgroundColor: "#041026",
//         borderColor: "rgba(99, 102, 241, 1)",
//         borderWidth: 1,
//       },
//     ],
//   };

//   const barOptions = {
//     responsive: true,
//     plugins: {
//       legend: { display: false },
//       tooltip: { mode: "index", intersect: false },
//     },
//     scales: {
//       x: {display: false, grid: { display: false } },
//       y: {display: false, grid: { display: false }, beginAtZero: true },
//     },
//   };

//   return (
//     <>
//       <div className="pt-5 flex flex-col gap-3 bg-gray-100 w-7/8! sm:w-3/4 h-screen">
//         <div className="mt-3 flex w-full h-1/4 gap-3 flex-wrap sm:flex-nowrap">
//           <div className="flex flex-col p-2 h-full w-[30%] sm:w-[30%] rounded bg-white ml-3">
//             <Line className="" data={data1} options={options} />
//           </div>

//           <div className="flex items-center bg-white h-full w-[60%] rounded">
//             <div className="flex flex-col gap-3 items-center justify-center border-r border-gray-400 h-[70%] w-1/4">
//               <div className="rounded-[50%] bg-green-200 text-green-700 flex justify-center items-center p-3">
//                 <i className="fa-solid fa-sack-dollar"></i>
//               </div>
//               <div className="text-md font-bold">{data.reduce((sum, item) => sum + item.price, 0)}</div>
//               <div className="text-sm!">Earning</div>
//             </div>
//             <div className="flex flex-col gap-3 items-center justify-center border-r border-gray-400 h-[70%] w-1/4">
//               <div className="rounded-[50%] bg-blue-200 text-blue-700 flex justify-center items-center p-3">
//                 <i className="fa-solid fa-cart-shopping"></i>
//               </div>
//               <div className="text-md font-bold">{data.length}</div>
//               <div className="text-sm!">Orders</div>
//             </div>
//             <div className="flex flex-col gap-3 items-center justify-center border-r border-gray-400 h-[70%] w-1/4">
//               <div className="rounded-[50%] bg-red-200 text-red-700 flex justify-center items-center p-3">
//                 <i className="fa-solid fa-hourglass-half"></i>
//               </div>
//               <div className="text-md font-bold">{data.filter(a => a.status === "Pending").length}</div>
//               <div className="text-sm!">Pending</div>
//             </div>
//             <div className="flex flex-col gap-3 items-center justify-center h-[70%] w-1/4">
//               <div className="rounded-[50%] bg-orange-200 text-orange-700 flex justify-center items-center p-3">
//                 <i className="fa-solid fa-users"></i>
//               </div>
//               <div className="text-md font-bold">{new Set(data.map(item => item.username)).size}</div>
//               <div className="text-sm!">Users</div>
//             </div>
//           </div>
//         </div>

//         <div className="flex gap-3 w-full h-1/2">
//           <div className="flex flex-col items-center justify-center h-full w-full sm:w-[30%] rounded bg-white ml-3 p-3">
//             {/* <h3>Riders</h3> */}
//             <Bar data={barData} options={barOptions} />
//           </div>
//           <div className="mt-9 h-full flex items-center justify-center w-[60%] sm:mt-0 sm:w-[60%] rounded bg-white">
//             <div className="w-[80%] h-[80%] ml-[25%]">
//               <Pie data={data2} options={options1} />
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   )
// }