import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GameSession } from '../App';

interface LobbyScreenProps {
  onStartGame: (session: GameSession) => void;
}

interface Chapter {
  id: string;
  name: string;
  description: string;
  biome: string;
  maxPlayers: number;
  estimatedDuration: number;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ onStartGame }) => {
  const [username, setUsername] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<string>('neon-docks');
  const [roomCode, setRoomCode] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  // Fetch available chapters
  const { data: chapters, isLoading: chaptersLoading } = useQuery<Chapter[]>({
    queryKey: ['chapters'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/chapters`);
      if (!response.ok) throw new Error('Failed to fetch chapters');
      const data = await response.json();
      return data.chapters;
    }
  });

  const handleCreateRoom = async () => {
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    setIsCreatingRoom(true);
    
    try {
      const playerId = Math.random().toString(36).substr(2, 9);
      
      const response = await fetch(`${API_BASE}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostId: playerId,
          hostUsername: username.trim(),
          chapterId: selectedChapter,
          maxPlayers: 8
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      const data = await response.json();
      
      const session: GameSession = {
        roomCode: data.room.code,
        roomId: data.room.id,
        playerId: playerId,
        username: username.trim(),
        chapterId: selectedChapter
      };

      onStartGame(session);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!username.trim() || !roomCode.trim()) {
      alert('Please enter both username and room code');
      return;
    }

    setIsJoiningRoom(true);
    
    try {
      const playerId = Math.random().toString(36).substr(2, 9);
      
      // For now, we'll simulate joining a room
      // In a real implementation, this would call the Socket.io join_room event
      const session: GameSession = {
        roomCode: roomCode.trim().toUpperCase(),
        roomId: `room_${Date.now()}`,
        playerId: playerId,
        username: username.trim(),
        chapterId: 'neon-docks' // Default chapter for now
      };

      onStartGame(session);
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room. Please check the room code and try again.');
    } finally {
      setIsJoiningRoom(false);
    }
  };

  if (chaptersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto mb-4"></div>
          <p className="text-gray-400">Loading chapters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-dark via-cyber-gray to-cyber-dark p-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-cyber text-neon-blue text-shadow mb-4">
            PortPlay
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Enter the mysterious port and embark on episodic multiplayer adventures. 
            Create or join rooms with friends to solve puzzles, battle enemies, and uncover secrets.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Room Section */}
          <div className="cyber-panel">
            <h2 className="text-2xl font-cyber text-neon-blue mb-6 text-center">
              Create New Adventure
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="input-field w-full"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Choose Chapter
                </label>
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="input-field w-full"
                >
                  {chapters?.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.name} ({chapter.maxPlayers} players, ~{chapter.estimatedDuration}min)
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleCreateRoom}
                disabled={isCreatingRoom || !username.trim()}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingRoom ? 'Creating Room...' : 'Create Room'}
              </button>
            </div>
          </div>

          {/* Join Room Section */}
          <div className="cyber-panel">
            <h2 className="text-2xl font-cyber text-neon-green mb-6 text-center">
              Join Existing Adventure
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="input-field w-full"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit room code"
                  className="input-field w-full font-mono text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>

              <button
                onClick={handleJoinRoom}
                disabled={isJoiningRoom || !username.trim() || !roomCode.trim()}
                className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoiningRoom ? 'Joining Room...' : 'Join Room'}
              </button>
            </div>
          </div>
        </div>

        {/* Chapter Information */}
        {chapters && (
          <div className="mt-12">
            <h3 className="text-2xl font-cyber text-center text-neon-pink mb-6">
              Available Chapters
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {chapters.map((chapter) => (
                <div key={chapter.id} className="cyber-panel">
                  <h4 className="text-lg font-cyber text-neon-blue mb-2">
                    {chapter.name}
                  </h4>
                  <p className="text-gray-300 text-sm mb-3">
                    {chapter.description}
                  </p>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Max Players: {chapter.maxPlayers}</span>
                    <span>~{chapter.estimatedDuration} min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p className="mb-2">
            <strong>How to play:</strong> Create a room and share the code with friends, 
            or join an existing room using a friend's code.
          </p>
          <p>
            Use WASD to move, Space to jump, Shift to run, and E to interact with objects.
          </p>
        </div>
      </div>
    </div>
  );
};
