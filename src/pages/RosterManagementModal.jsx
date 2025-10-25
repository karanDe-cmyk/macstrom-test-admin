import React, { useState, useEffect, useRef } from 'react';
import {
  X, // Close icon
  Shield, // Captain icon
  Users, // Player/Sub icon
  GripVertical, // Drag handle icon
  ToggleLeft, // Active status icon (green circle)
  ToggleRight // Inactive status icon (red circle with line)
} from 'lucide-react';


// Demo VoteStream WebSocket simulation for team and members
function useDemoVoteStream(initialVotes = 0) {
  const [votes, setVotes] = useState(initialVotes);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    let running = true;
    function randomVoteChange() {
      if (!running) return;
      const inc = Math.floor(Math.random() * 5);
      if (inc > 0) {
        setVotes(v => v + inc);
        setAnimate(true);
        setTimeout(() => setAnimate(false), 500);
      }
      setTimeout(randomVoteChange, 1000 + Math.random() * 1000);
    }
    randomVoteChange();
    return () => { running = false; };
  }, []);
  return [votes, animate];
}


const RosterManagementModal = ({ team, onClose }) => {
  // Local state for roster members, allowing reordering and active status toggle
  const [rosterMembers, setRosterMembers] = useState(team?.roster || []);
  const [activeMembersCount, setActiveMembersCount] = useState(0);

  // Demo VoteStream: live vote count for this team
  const [liveVotes, teamAnimate] = useDemoVoteStream(team?.votesState || 0);
  // Demo VoteStream: live votes for each member (simulate with random start)
  const [memberVotes, setMemberVotes] = useState(() => rosterMembers.map(() => Math.floor(Math.random() * 100)));
  const [memberAnimates, setMemberAnimates] = useState(() => rosterMembers.map(() => false));

  // Set up a vote stream for each member
  useEffect(() => {
    const timers = rosterMembers.map((_, idx) => {
      function updateVote() {
        setMemberVotes(vs => {
          const inc = Math.floor(Math.random() * 4);
          if (inc > 0) {
            setMemberAnimates(anims => {
              const newAnims = [...anims];
              newAnims[idx] = true;
              setTimeout(() => {
                setMemberAnimates(a => {
                  const arr = [...a];
                  arr[idx] = false;
                  return arr;
                });
              }, 500);
              return newAnims;
            });
          }
          const arr = [...vs];
          arr[idx] += inc;
          return arr;
        });
        timers[idx] = setTimeout(updateVote, 1200 + Math.random() * 1200);
      }
      return setTimeout(updateVote, 800 + Math.random() * 1200);
    });
    return () => timers.forEach(t => clearTimeout(t));
    // eslint-disable-next-line
  }, [rosterMembers.length]);

  // Disable background scroll when modal opens
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Drag and Drop state
  const [draggingId, setDraggingId] = useState(null);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    // Calculate initial active members count
    const initialActiveCount = rosterMembers.filter(member => member.isActive).length;
    setActiveMembersCount(initialActiveCount);
  }, [rosterMembers]); // Recalculate if rosterMembers change

  if (!team) {
    return null; // Don't render if no team data is provided
  }

  const handleToggleActive = (memberId) => {
    setRosterMembers(prevMembers => {
      const updatedMembers = prevMembers.map(member =>
        member.id === memberId ? { ...member, isActive: !member.isActive } : member
      );
      // Recalculate active members count
      const newActiveCount = updatedMembers.filter(member => member.isActive).length;
      if (!updatedMembers.find(m => m.id === memberId).isActive && newActiveCount >= 15) {
        // If trying to activate and already at max, alert
        alert("Maximum 15 active members allowed. Please deactivate another member first.");
        return prevMembers; // Revert if over limit
      }
      setActiveMembersCount(newActiveCount);
      return updatedMembers;
    });
  };

  const handleSaveChanges = () => {
    console.log('Saving changes:', rosterMembers);
    alert('Roster changes saved (simulated)!');
    onClose(); // Close modal after saving
  };

  // Drag and Drop handlers
  const handleDragStart = (e, id) => {
    dragItem.current = id;
    setDraggingId(id);
  };

  const handleDragEnter = (e, id) => {
    dragOverItem.current = id;
  };

  const handleDragEnd = () => {
    setDraggingId(null); // Reset dragging state
    if (dragItem.current === null || dragOverItem.current === null) return;

    const newRoster = [...rosterMembers];
    const draggedItemIndex = newRoster.findIndex(item => item.id === dragItem.current);
    const dragOverItemIndex = newRoster.findIndex(item => item.id === dragOverItem.current);

    if (draggedItemIndex === -1 || dragOverItemIndex === -1) return;

    // Remove the dragged item
    const [reorderedItem] = newRoster.splice(draggedItemIndex, 1);
    // Insert it at the new position
    newRoster.splice(dragOverItemIndex, 0, reorderedItem);

    setRosterMembers(newRoster);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Helper to get member role icon
  const getRoleIcon = (role) => {
    switch (role.toLowerCase()) {
      case 'captain': return <Shield size={14} className="inline mr-1 text-purple-600" />;
      case 'player': return <Users size={14} className="inline mr-1 text-blue-600" />;
      case 'sub': return <Users size={14} className="inline mr-1 text-gray-600" />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl shadow-xl relative flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-xl text-gray-600 hover:text-black transition-colors"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        {/* Header with VoteStream */}
        <div className="pb-4 mb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Shield className="mr-2 text-purple-600" size={20} />
              Roster Management - {team.name}
            </h2>
            {/* Live VoteStream */}
            <div className={`flex items-center gap-2 bg-blue-50 border border-blue-200 rounded px-3 py-1 text-blue-700 text-sm font-semibold ${teamAnimate ? 'animate-pulse' : ''}`}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="2"/><path d="M8 12l2 2 4-4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Live Votes: <span className="font-bold">{liveVotes.toLocaleString()}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Drag and drop to reorder members. Toggle active status (max 15 active members).
          </p>
        </div>
        {/* Active Members Count & Save Changes */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-medium text-gray-700">
            Active Members: {activeMembersCount}/{team.maxMembers || 15}
          </p>
          <button
            onClick={handleSaveChanges}
            className="px-5 py-2 bg-black text-white rounded-md shadow-sm hover:bg-gray-800 transition-colors font-medium"
          >
            Save Changes
          </button>
        </div>
        {/* Roster List */}
        <div className="overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100" style={{ height: '35vh' }}>
          {rosterMembers.map((member, index) => (
            <div
              key={member.id}
              draggable
              onDragStart={(e) => handleDragStart(e, member.id)}
              onDragEnter={(e) => handleDragEnter(e, member.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`
                flex flex-col p-4 mb-3 rounded-lg border
                ${member.isActive ? 'bg-green-50 border-green-300 shadow-sm' : 'bg-gray-50 border-gray-200'}
                ${draggingId === member.id ? 'opacity-50 border-dashed border-blue-500' : ''}
                transition-all duration-200 ease-in-out cursor-grab active:cursor-grabbing
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-3/5">
                  {/* Drag Handle */}
                  <span className="text-gray-400 cursor-grab">
                    <GripVertical size={18} />
                  </span>
                  {/* Member Number */}
                  <span className="font-semibold text-gray-600 text-sm">#{index + 1 < 10 ? `0${index + 1}` : index + 1}</span>
                  {/* Avatar */}
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  {/* Name & Role */}
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      {member.name}
                    </h4>
                    <p className="text-xs text-gray-600 flex items-center gap-2">
                      <span className="flex items-center px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 font-medium" style={{borderRadius: '8px'}}>
                        {getRoleIcon(member.role)}
                        <span className="ml-1">{member.role}</span>
                      </span>
                      {member.isActive && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[11px] font-semibold border border-green-200" style={{borderRadius: '8px'}}>Active</span>
                      )}
                    </p>
                  </div>
                </div>
                {/* Toggle Active Icon Button + Member Live Votes */}
                <div className="flex items-center gap-4">
                  {/* Member Live Votes */}
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold relative overflow-hidden`} style={{minWidth:'70px'}}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className={`transition-transform duration-300 ${memberAnimates[index] ? 'animate-bounce' : ''}`} style={{display:'inline'}}><path d="M12 19V5M5 12l7-7 7 7" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="font-bold">{memberVotes[index]}</span> votes
                  </span>
                  <button
                    onClick={() => handleToggleActive(member.id)}
                    className={`
                      flex items-center justify-center w-5 h-5 rounded transition-colors duration-200
                      bg-gray-200 hover:bg-gray-300
                      border-0 hover:border hover:border-gray-400
                    `}
                    title={member.isActive ? "Deactivate Member" : "Activate Member"}
                  >
                    {member.isActive ? (
                      <ToggleLeft size={12} className="text-green-500" />
                    ) : (
                      <ToggleRight size={12} className="text-red-500" />
                    )}
                  </button>
                </div>
              </div>
              {/* ...existing code... */}
            </div>
          ))}
          {rosterMembers.length === 0 && (
            <div className="text-center py-10 text-gray-500">No roster members found for this team.</div>
          )}
        </div>
        {/* Footer actions (if any) */}
      </div>
    </div>
  );
};

export default RosterManagementModal;
