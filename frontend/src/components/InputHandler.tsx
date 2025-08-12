import React from 'react';
import { InputState } from '@portplay/shared';

interface InputHandlerProps {
  currentInput: InputState;
  onInputChange: (input: Partial<InputState>) => void;
}

export const InputHandler: React.FC<InputHandlerProps> = ({
  currentInput,
  onInputChange: _onInputChange
}) => {
  return (
    <div className="absolute bottom-4 left-4 z-20">
      <div className="cyber-panel p-4 max-w-xs">
        <h3 className="text-sm font-cyber text-neon-blue mb-3">Input Debug</h3>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>Forward (W):</span>
            <span className={currentInput.forward ? 'text-green-400' : 'text-gray-500'}>
              {currentInput.forward ? 'ON' : 'OFF'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Backward (S):</span>
            <span className={currentInput.backward ? 'text-green-400' : 'text-gray-500'}>
              {currentInput.backward ? 'ON' : 'OFF'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Left (A):</span>
            <span className={currentInput.left ? 'text-green-400' : 'text-gray-500'}>
              {currentInput.left ? 'ON' : 'OFF'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Right (D):</span>
            <span className={currentInput.right ? 'text-green-400' : 'text-gray-500'}>
              {currentInput.right ? 'ON' : 'OFF'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Jump (Space):</span>
            <span className={currentInput.jump ? 'text-green-400' : 'text-gray-500'}>
              {currentInput.jump ? 'ON' : 'OFF'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Run (Shift):</span>
            <span className={currentInput.run ? 'text-green-400' : 'text-gray-500'}>
              {currentInput.run ? 'ON' : 'OFF'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Dash (Q):</span>
            <span className={currentInput.dash ? 'text-green-400' : 'text-gray-500'}>
              {currentInput.dash ? 'ON' : 'OFF'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Attack:</span>
            <span className={currentInput.attack ? 'text-green-400' : 'text-gray-500'}>
              {currentInput.attack ? 'ON' : 'OFF'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Interact (E):</span>
            <span className={currentInput.interact ? 'text-green-400' : 'text-gray-500'}>
              {currentInput.interact ? 'ON' : 'OFF'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Use Item:</span>
            <span className={currentInput.useItem ? 'text-green-400' : 'text-gray-500'}>
              {currentInput.useItem ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-cyber-light">
          <div className="text-xs text-gray-400">
            <div>Active Inputs: {
              Object.values(currentInput).filter(Boolean).length
            }</div>
          </div>
        </div>
      </div>
    </div>
  );
};
