import React, { useState, useEffect, useContext } from 'react';
import { Users, UserPlus, Gamepad2, CreditCard, FileText, TrendingUp, Activity, BarChart3, Target, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import ThemeContext from '../contexts/ThemeContext';


const Dashboard = () => {
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [reports, setReports] = useState([]);
  const [teams, setTeams] = useState([]); 
  const [allTeamsForOverview, setAllTeamsForOverview] = useState([]); // 👈 NEW STATE for combined teams
  const [subscriptions, setSubscriptions] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0); 
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  
  // Token from localStorage
  const authToken = localStorage.getItem("authToken");

 // Helper function to extract array data from API response
 const extractArray = (data, keys = ["users", "data", "subscriptions"]) =>
  Array.isArray(data)
    ? data
    : keys.reduce(
        (acc, key) => (Array.isArray(data[key]) ? data[key] : acc),
        []
      );


 const fetchData = async () => {
  try {
    setIsLoading(true);

    const [
      usersRes,
      pubgTournamentsRes,
      freefireTournamentsRes,
      reportsRes,
      teamsRes, // 👈 /admin/teams (for full list, possibly with 0 members)
      subscriptionsRes,
      teamCountsRes // 👈 /macstrom-tournament/team-counts (for accurate member counts)
    ] = await Promise.all([
      axiosInstance.get("/v1/user"),             
      axiosInstance.get("/macstrom-tournament/pubg/registrations"),            
      axiosInstance.get("/macstrom-tournament/freefire/registrations"),            
      axiosInstance.get("/reports/reports"), 
      axiosInstance.get("/admin/teams"),
      axiosInstance.get("/subscriptions"),
      axiosInstance.get("/macstrom-tournament/team-counts"), 
    ]);

    const usersData = usersRes.data;
    const pubgTournamentsData = pubgTournamentsRes.data;
    const freefireTournamentsData = freefireTournamentsRes.data;
    const reportsData = reportsRes.data;
    const teamsData = teamsRes.data;
    const subscriptionsData = subscriptionsRes.data;
    const teamCountsData = teamCountsRes.data; 

    setUsers(extractArray(usersData, ["users", "data"]));
    setTeams(extractArray(teamsData, ["teams", "data"])); // Sets the total teams count

    // Combine tournaments data
    const allTournaments = [
      ...(Array.isArray(pubgTournamentsData) ? pubgTournamentsData : (pubgTournamentsData.data || [])),
      ...(Array.isArray(freefireTournamentsData) ? freefireTournamentsData : (freefireTournamentsData.data || []))
    ];
    setTournaments(allTournaments);
    
    setReports(Array.isArray(reportsData) ? reportsData : (reportsData.data || []));
    setSubscriptions(extractArray(subscriptionsData, ["subscriptions", "data"]));

    // 1. Set Total Members
    let memberCount = 0;
    if (teamCountsData && typeof teamCountsData.totalUsers === 'number') {
        memberCount = teamCountsData.totalUsers;
    }
    setTotalMembers(memberCount);
    
    // 2. Combine and map team lists for the Overview section
    const fullTeamList = extractArray(teamsData, ["teams", "data"]); // Teams from /admin/teams (has all team names, possibly outdated member count)
    const teamCountsMap = new Map();

    // Map the accurate counts from the new API for quick lookup
    if (teamCountsData && Array.isArray(teamCountsData.data)) {
        teamCountsData.data.forEach(team => {
            teamCountsMap.set(team.teamName, {
                total: team.total,
                byGame: team.byGame
            });
        });
    }

    // Merge lists: start with the full list and overlay accurate data
    const combinedTeams = fullTeamList.map(adminTeam => {
        const teamName = adminTeam.name || adminTeam.teamName;
        const accurateData = teamCountsMap.get(teamName);

        // If accurate data exists, use it. Otherwise, rely on the existing member count (which might be 0)
        return {
            ...adminTeam,
            name: teamName,
            members: accurateData 
                ? Array(accurateData.total).fill({}) // Create an array of correct length
                : adminTeam.members || [], // Fallback to existing member list/empty array
            totalMembers: accurateData ? accurateData.total : (adminTeam.members?.length || 0),
            byGame: accurateData?.byGame || {} // Add game info if available
        };
    });

    setAllTeamsForOverview(combinedTeams);
    // 👆 END of combination logic
   
    // Build chart data (unchanged)
    const chartDataArray = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");

      const usersOnDate = extractArray(usersData, ["users", "data"]).filter(
        (user) => user.createdAt && format(parseISO(user.createdAt), "yyyy-MM-dd") === dateStr
      ).length;

      const tournamentsCount = allTournaments.filter(
        (tournament) => tournament.createdAt && format(parseISO(tournament.createdAt), "yyyy-MM-dd") === dateStr
      ).length;

      const subscriptionsOnDate = extractArray(subscriptionsData, ["subscriptions", "data"]).filter(
        (sub) => sub.createdAt && format(parseISO(sub.createdAt), "yyyy-MM-dd") === dateStr
      ).length;

      chartDataArray.push({
        date: format(date, "MMM dd"),
        fullDate: dateStr,
        users: usersOnDate,
        registrations: tournamentsCount,
        subscriptions: subscriptionsOnDate,
      });
    }

    setChartData(chartDataArray);
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);

  const getRecentSubscriptions = () => subscriptions
    .filter(s => s.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const CustomTooltip = ({ active, payload, label }) => {
    // ... (CustomTooltip component implementation - unchanged)
    if (active && payload && payload.length) {
      return (
        <div className={`p-4 rounded-lg shadow-lg border ${
          darkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <p className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{label}</p>
          {payload.map((entry, idx) => (
            <p key={idx} className="flex items-center" style={{ color: entry.color }}>
              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    // ... (Loading state - unchanged)
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
          : 'bg-gradient-to-br from-slate-50 to-blue-50'
      }`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className={`font-medium text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-slate-50 to-blue-50'
    }`}>
      {/* Header, Key Metrics, Growth Chart, Recent Activity (All Unchanged) */}

      <div className={`backdrop-blur-sm shadow-sm border-b sticky top-0 z-10 ${
        darkMode 
          ? 'bg-gray-800/80 border-gray-700/50' 
          : 'bg-white/80 border-gray-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MacStorm Analytics
            </h1>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Real-time insights into your gaming platform</p>
          </div>
          <div className="flex items-center space-x-4">

            <button 
              onClick={fetchData}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users Card (Unchanged) */}
          <div 
            onClick={() => navigate('/users')} 
            className={`rounded-2xl shadow-lg border p-6 hover:shadow-xl transition duration-300 transform hover:-translate-y-1 cursor-pointer ${ 
              darkMode 
                ? 'bg-gray-800/70 border-gray-700' 
                : 'bg-white/70 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
                <Users className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-4">
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatNumber(users.length)}</h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Users</p>
            </div>
          </div>
            {/* ... other Key Metrics Cards (Unchanged) ... */}
          <div 
            onClick={() => navigate('/games-registation')} 
            className={`rounded-2xl shadow-lg border p-6 hover:shadow-xl transition duration-300 transform hover:-translate-y-1 cursor-pointer ${ 
              darkMode 
                ? 'bg-gray-800/70 border-gray-700' 
                : 'bg-white/70 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-4">
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatNumber(tournaments.length)}</h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tournament Registrations</p>
            </div>
          </div>
          <div 
            onClick={() => navigate('/suscription')} 
            className={`rounded-2xl shadow-lg border p-6 hover:shadow-xl transition duration-300 transform hover:-translate-y-1 cursor-pointer ${ 
              darkMode 
                ? 'bg-gray-800/70 border-gray-700' 
                : 'bg-white/70 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-4">
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatNumber(subscriptions.length)}</h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Subscriptions</p>
            </div>
          </div>
          <div 
            onClick={() => navigate('/Reportss')} 
            className={`rounded-2xl shadow-lg border p-6 hover:shadow-xl transition duration-300 transform hover:-translate-y-1 cursor-pointer ${ 
              darkMode 
                ? 'bg-gray-800/70 border-gray-700' 
                : 'bg-white/70 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-4">
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatNumber(reports.length)}</h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Generated Reports</p>
            </div>
          </div>
        </div>
        {/* ... Growth Chart & Recent Activity ... */}
        <div className={`rounded-2xl shadow-lg border p-8 mb-8 ${
          darkMode 
            ? 'bg-gray-800/70 border-gray-700' 
            : 'bg-white/70 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Platform Growth Analytics</h3>
              <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Track registrations and subscriptions over the last 30 days</p>
            </div>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} strokeOpacity={0.5} />
                <XAxis dataKey="date" stroke={darkMode ? "#9CA3AF" : "#6B7280"} fontSize={12} tickLine={false} axisLine={false} interval={3} />
                <YAxis stroke={darkMode ? "#9CA3AF" : "#6B7280"} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" name="New Users" />
                <Line type="monotone" dataKey="registrations" stroke="#10B981" name="Registrations" />
                <Line type="monotone" dataKey="subscriptions" stroke="#8B5CF6" name="Subscriptions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Recent Activity (Unchanged) */}
          <div className={`lg:col-span-2 backdrop-blur-sm rounded-2xl shadow-lg border p-6 ${
            darkMode 
              ? 'bg-gray-800/70 border-gray-700/20' 
              : 'bg-white/70 border-white/20'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Recent Activity</h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Latest tournament registrations and subscriptions</p>
              </div>
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {tournaments.length > 0 ? (
                tournaments
                  .filter(t => t.createdAt)
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 5)
                  .map(tournament => (
                    <div key={tournament._id || tournament.id} className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 border ${
                      darkMode 
                        ? 'hover:bg-blue-900/30 border-transparent hover:border-blue-700' 
                        : 'hover:bg-blue-50/50 border-transparent hover:border-blue-200'
                    }`}>
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <Gamepad2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
  {tournament.teamName || 'Unnamed Team'}
</p>
<p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
  Game: {tournament.game || 'Unknown'}
</p>
<p className="text-blue-600 text-xs font-medium">
  Player: {tournament.inGameUsername || 'Unknown'}
</p>
<p className="text-xs text-gray-500">
  Registered on: {tournament.registrationDate ? new Date(tournament.registrationDate).toLocaleDateString() : 'Unknown'}
</p>

                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {tournament.createdAt ? format(parseISO(tournament.createdAt), 'MMM dd, yyyy') : 'Unknown date'}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{tournament.createdAt ? format(parseISO(tournament.createdAt), 'HH:mm') : 'Unknown time'}</p>
                        <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                          tournament.status === 'approved' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : tournament.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
{/*                           {tournament.status || 'unknown'} */}
                        </span>
                    </div>
                  </div>
                  ))
              ) : (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  <Gamepad2 className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p>No recent tournament registrations</p>
                </div>
              )}

              {getRecentSubscriptions().length > 0 ? (
                getRecentSubscriptions().map(subscription => (
                  <div key={subscription._id || subscription.id} className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 border ${
                    darkMode 
                      ? 'hover:bg-purple-900/30 border-transparent hover:border-purple-700' 
                      : 'hover:bg-purple-50/50 border-transparent hover:border-purple-200'
                  }`}>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{subscription.planName || subscription.plan || 'Unknown'} Plan | ₹{subscription.price || 'N/A'}</p>
                      <p className="text-purple-600 text-xs font-medium">
                        New subscription activated
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{subscription.createdAt ? format(parseISO(subscription.createdAt), 'MMM dd, yyyy') : 'Unknown date'}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{subscription.createdAt ? format(parseISO(subscription.createdAt), 'HH:mm') : 'Unknown time'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  <CreditCard className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p>No recent subscription activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Teams Overview (FIXED to show ALL teams with correct counts) */}
          <div className={`backdrop-blur-sm rounded-2xl shadow-lg border p-6 ${
            darkMode 
              ? 'bg-gray-800/70 border-gray-700/20' 
              : 'bg-white/70 border-white/20'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Tournament Overview</h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Tournament and members</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">{formatNumber(totalMembers)} Members</span>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {allTeamsForOverview.length > 0 ? (
                allTeamsForOverview.map((team, index) => (
                  <div key={team._id || team.id || index} className={`p-4 rounded-xl border transition-all duration-200 ${
                    darkMode 
                      ? 'border-gray-600 hover:border-emerald-600 hover:bg-emerald-900/30' 
                      : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{team.name || team.teamName || 'Unnamed Team'}</h4>
                      {/* Use the merged totalMembers field */}
                      <span className="text-sm font-medium text-emerald-600">{team.totalMembers || 0} members</span>
                    </div>
                    {/* Use the merged byGame info for games list */}
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {team.byGame && Object.keys(team.byGame).length > 0
                          ? `Games: ${Object.keys(team.byGame).join(', ')}`
                          : (team.createdAt ? `Created ${format(parseISO(team.createdAt), 'MMM dd, yyyy')}` : 'Creation date unknown')
                        }
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-2">
                        {/* Use the merged totalMembers field for the avatar count */}
                        {[...Array(Math.min(team.totalMembers || 0, 4))].map((_, i) => (
                          <div key={i} className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-white text-xs font-medium">{i + 1}</span>
                          </div>
                        ))}
                        {(team.totalMembers || 0) > 4 && (
                          <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-gray-600 font-medium">+{(team.totalMembers || 0) - 4}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  <Users className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p>No teams available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tournament Analytics, Reports Analytics (Unchanged) */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className={`backdrop-blur-sm rounded-2xl shadow-lg border p-6 ${
            darkMode 
              ? 'bg-gray-800/70 border-gray-700/20' 
              : 'bg-white/70 border-white/20'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Tournament Analytics</h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Registration trends and performance</p>
              </div>
              <Gamepad2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="space-y-6">
              <div className={`flex items-center justify-between p-4 rounded-xl ${
                darkMode 
                  ? 'bg-gradient-to-r from-emerald-900/50 to-emerald-800/50' 
                  : 'bg-gradient-to-r from-emerald-50 to-emerald-100'
              }`}>
                <div>
                  <p className="text-emerald-700 font-medium">Total Tournaments <br></br> Registrations</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-900'}`}>{formatNumber(tournaments.length)}</p>
                </div>
                <div className="text-emerald-600">
                  <Target className="w-8 h-8" />
                </div>
              </div>

<div className="grid grid-cols-2 gap-4">
  <div className={`text-center p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>This Week</p>
    <p className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      {tournaments.filter(t => t.createdAt && new Date(t.createdAt) > subDays(new Date(), 7)).length}
    </p>
  </div>

  <div className={`text-center p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>This Month</p>
    <p className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      {tournaments.filter(t => t.createdAt && new Date(t.createdAt) > subDays(new Date(), 30)).length}
    </p>
  </div>

  {/* ✅ Centered Total Tournaments */}
  <div className={`text-center p-4 rounded-xl col-span-2 mx-auto w-1/2 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Tournaments</p>
    <p className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      {tournaments.length}
    </p>
  </div>
</div>

            </div>
          </div>

         <div className={`backdrop-blur-sm rounded-2xl shadow-lg border p-6 ${
  darkMode 
    ? 'bg-gray-800/70 border-gray-700/20' 
    : 'bg-white/70 border-white/20'
}`}>
  <div className="flex items-center justify-between mb-6">
    <div>
      <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Reports Analytics</h3>
      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Generated reports and insights</p>
    </div>
    <FileText className="w-6 h-6 text-amber-600" />
  </div>

  <div className="space-y-6">
    {/* Total Reports */}
    <div className={`flex items-center justify-between p-4 rounded-xl ${
      darkMode 
        ? 'bg-gradient-to-r from-amber-900/50 to-amber-800/50' 
        : 'bg-gradient-to-r from-amber-50 to-amber-100'
    }`}>
      <div>
        <p className="text-amber-700 font-medium">Total Reports</p>
        <p className={`text-2xl font-bold ${darkMode ? 'text-amber-400' : 'text-amber-900'}`}>
          {formatNumber(reports.length)}
        </p>
      </div>
      <div className="text-amber-600">
        <BarChart3 className="w-8 h-8" />
      </div>
    </div>

    {/* This Week & This Month */}
    <div className="grid grid-cols-2 gap-4">
      <div className={`text-center p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>This Week</p>
        <p className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {reports.filter(r => r.createdAt && new Date(r.createdAt) > subDays(new Date(), 7)).length}
        </p>
      </div>

      <div className={`text-center p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>This Month</p>
        <p className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {reports.filter(r => r.createdAt && new Date(r.createdAt) > subDays(new Date(), 30)).length}
        </p>
      </div>
    </div>

    {/* Total Teams */}
{/*     <div className={`text-center p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Tournaments</p>
      <p className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{teams.length}</p>
    </div> */}
  </div>
</div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;