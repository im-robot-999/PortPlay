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
  objectives?: string[]; // Added for objectives preview
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ onStartGame }) => {
  const [username, setUsername] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<string>('neon-docks');
  const [roomCode, setRoomCode] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');

  // Fetch available chapters
  const { data: chapters, isLoading: chaptersLoading, error: chaptersError } = useQuery<Chapter[]>({
    queryKey: ['chapters'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/chapters`);
      if (!response.ok) throw new Error('Failed to fetch chapters');
      const data = await response.json();
      return data.chapters;
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000, // Cache for 30 seconds
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyber-dark via-cyber-gray to-cyber-dark">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-neon-pink border-b-transparent rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
          </div>
          <p className="text-gray-300 font-cyber text-lg">Initializing PortPlay...</p>
          <div className="mt-4 flex space-x-2 justify-center">
            <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-neon-pink rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-dark via-cyber-gray to-cyber-dark relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-neon-blue rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-neon-pink rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-neon-blue rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-7xl font-cyber text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-pink to-neon-green mb-4 animate-glow">
              PortPlay
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-neon-blue to-neon-pink mx-auto rounded-full"></div>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Embark on episodic multiplayer adventures in mysterious ports. 
            <span className="text-neon-blue font-medium"> Create</span> or <span className="text-neon-green font-medium">join</span> rooms with friends to solve puzzles, battle enemies, and uncover secrets.
          </p>
        </div>

        {/* Main Action Panel */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-gradient-to-br from-cyber-gray/80 to-cyber-dark/80 backdrop-blur-sm border border-cyber-light/50 rounded-2xl p-8 shadow-2xl">
            {/* Tab Navigation */}
            <div className="flex mb-8 bg-cyber-dark rounded-xl p-1">
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-3 px-6 rounded-lg font-cyber text-sm transition-all duration-300 ${
                  activeTab === 'create'
                    ? 'bg-gradient-to-r from-neon-blue to-blue-500 text-cyber-dark shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Create Room</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('join')}
                className={`flex-1 py-3 px-6 rounded-lg font-cyber text-sm transition-all duration-300 ${
                  activeTab === 'join'
                    ? 'bg-gradient-to-r from-neon-green to-green-500 text-cyber-dark shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  <span>Join Room</span>
                </div>
              </button>
            </div>

            {/* Username Input */}
            <div className="mb-6">
              <label className="block text-sm font-cyber text-gray-300 mb-3">
                Your Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full bg-cyber-dark border border-cyber-light rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all duration-300 font-cyber"
                maxLength={20}
              />
            </div>

            {/* Tab Content */}
            {activeTab === 'create' ? (
              <div>
                <div className="mb-6">
                  <label className="block text-sm font-cyber text-gray-300 mb-3">
                    Choose Chapter
                  </label>
                  <div className="relative">
                    <select
                      value={selectedChapter}
                      onChange={(e) => setSelectedChapter(e.target.value)}
                      className="w-full bg-cyber-dark border border-cyber-light rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all duration-300 font-cyber appearance-none"
                    >
                      {chapters?.map((chapter) => (
                        <option key={chapter.id} value={chapter.id}>
                          {chapter.name} • {chapter.maxPlayers} players • ~{chapter.estimatedDuration}min
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  {selectedChapter && chapters && (
                    <div className="mt-2 text-xs text-neon-blue font-cyber">
                      Selected: {chapters.find(c => c.id === selectedChapter)?.name}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCreateRoom}
                  disabled={isCreatingRoom || !username.trim()}
                  className="w-full bg-gradient-to-r from-neon-blue to-blue-500 text-cyber-dark font-cyber font-bold py-4 px-6 rounded-xl hover:from-blue-400 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {isCreatingRoom ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Room...</span>
                    </div>
                  ) : (
                    'Create Adventure'
                  )}
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <label className="block text-sm font-cyber text-gray-300 mb-3">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit code"
                    className="w-full bg-cyber-dark border border-cyber-light rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent transition-all duration-300 font-mono text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>

                <button
                  onClick={handleJoinRoom}
                  disabled={isJoiningRoom || !username.trim() || !roomCode.trim()}
                  className="w-full bg-gradient-to-r from-neon-green to-green-500 text-cyber-dark font-cyber font-bold py-4 px-6 rounded-xl hover:from-green-400 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {isJoiningRoom ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin"></div>
                      <span>Joining Room...</span>
                    </div>
                  ) : (
                    'Join Adventure'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chapter Showcase */}
        {chapters && chapters.length > 0 && (
          <div className="mb-16">
            <h3 className="text-3xl font-cyber text-center text-white mb-8">
              Available Chapters
            </h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {chapters.map((chapter) => (
                <div 
                  key={chapter.id} 
                  className={`group relative bg-gradient-to-br from-cyber-gray/80 to-cyber-dark/80 backdrop-blur-sm border-2 rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                    selectedChapter === chapter.id 
                      ? 'border-neon-blue shadow-cyber' 
                      : 'border-cyber-light/30 hover:border-neon-blue/50'
                  }`}
                  onClick={() => setSelectedChapter(chapter.id)}
                >
                  {/* Selection indicator */}
                  {selectedChapter === chapter.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-neon-blue rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-cyber-dark" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {/* Chapter header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-xl font-cyber text-neon-blue group-hover:text-neon-pink transition-colors duration-300 mb-2">
                        {chapter.name}
                      </h4>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-xs bg-neon-blue/20 text-neon-blue px-3 py-1 rounded-full font-cyber border border-neon-blue/30">
                          {chapter.maxPlayers} Players
                        </span>
                        <span className="text-xs bg-neon-pink/20 text-neon-pink px-3 py-1 rounded-full font-cyber border border-neon-pink/30">
                          ~{chapter.estimatedDuration}m
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chapter description */}
                  <p className="text-gray-300 text-sm leading-relaxed mb-4 min-h-[3rem]">
                    {chapter.description}
                  </p>

                  {/* Chapter details */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-cyber capitalize">{chapter.biome}</span>
                    </div>
                    
                    {/* Objectives preview */}
                    {chapter.objectives && chapter.objectives.length > 0 && (
                      <div className="text-xs text-gray-500">
                        <span className="font-cyber text-neon-green">Objectives:</span>
                        <ul className="mt-1 space-y-1">
                          {chapter.objectives.slice(0, 2).map((objective, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="text-neon-green mt-1">•</span>
                              <span>{objective}</span>
                            </li>
                          ))}
                          {chapter.objectives.length > 2 && (
                            <li className="text-neon-pink text-xs">
                              +{chapter.objectives.length - 2} more objectives
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neon-blue/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              ))}
            </div>

            {/* Chapter selection feedback */}
            {selectedChapter && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center space-x-3 bg-cyber-gray/40 backdrop-blur-sm border border-neon-blue/30 rounded-xl px-6 py-3">
                  <svg className="w-5 h-5 text-neon-blue" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-neon-blue font-cyber">
                    Selected: {chapters.find(c => c.id === selectedChapter)?.name}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error state for chapters */}
        {chaptersError && (
          <div className="mb-16 text-center">
            <div className="bg-cyber-gray/40 backdrop-blur-sm border border-red-500/30 rounded-xl p-8 max-w-md mx-auto">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h4 className="text-lg font-cyber text-red-400 mb-2">Failed to Load Chapters</h4>
              <p className="text-sm text-gray-400 mb-4">
                Unable to load available chapters. You can still create a room with the default chapter.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg font-cyber text-sm hover:bg-red-500/30 transition-colors duration-300"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Fallback if no chapters */}
        {chapters && chapters.length === 0 && !chaptersError && (
          <div className="mb-16 text-center">
            <div className="bg-cyber-gray/40 backdrop-blur-sm border border-cyber-light/30 rounded-xl p-8 max-w-md mx-auto">
              <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <h4 className="text-lg font-cyber text-gray-400 mb-2">No Chapters Available</h4>
              <p className="text-sm text-gray-500">
                Check back later for new adventures!
              </p>
            </div>
          </div>
        )}

        {/* Quick Instructions */}
        <div className="text-center">
          <div className="inline-block bg-cyber-gray/40 backdrop-blur-sm border border-cyber-light/30 rounded-xl p-6 max-w-2xl">
            <h4 className="text-lg font-cyber text-neon-blue mb-3">Quick Start Guide</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="text-left">
                <p className="mb-2"><span className="text-neon-green font-medium">1.</span> Create a room and share the code with friends</p>
                <p><span className="text-neon-green font-medium">2.</span> Or join an existing room using a friend's code</p>
              </div>
              <div className="text-left">
                <p className="mb-2"><span className="text-neon-pink font-medium">WASD:</span> Move • <span className="text-neon-pink font-medium">Space:</span> Jump</p>
                <p><span className="text-neon-pink font-medium">Shift:</span> Run • <span className="text-neon-pink font-medium">E:</span> Interact</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
