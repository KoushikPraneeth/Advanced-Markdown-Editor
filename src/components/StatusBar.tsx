
import React from 'react';
import { Clock, FileText, BarChart, Zap } from 'lucide-react';
import { calculateWordCount, calculateCharacterCount, calculateReadingTime, formatReadingTime } from '@/utils/textAnalytics';

interface StatusBarProps {
  content: string;
  isDarkMode: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ content, isDarkMode }) => {
  const wordCount = calculateWordCount(content);
  const charCount = calculateCharacterCount(content);
  const readingTime = calculateReadingTime(content);
  const lineCount = content.split('\n').length;

  const getProgressColor = (words: number) => {
    if (words < 100) return 'text-red-500';
    if (words < 500) return 'text-yellow-500';
    if (words < 1000) return 'text-blue-500';
    return 'text-green-500';
  };

  const getProgressWidth = (words: number) => {
    return Math.min((words / 2000) * 100, 100);
  };

  return (
    <div className={`border-t px-6 py-3 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6 text-sm">
          <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <FileText className="h-4 w-4" />
            <span className="font-medium">{wordCount.toLocaleString()}</span>
            <span className="text-xs opacity-75">words</span>
          </div>
          
          <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <BarChart className="h-4 w-4" />
            <span className="font-medium">{charCount.toLocaleString()}</span>
            <span className="text-xs opacity-75">chars</span>
          </div>
          
          <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <span className="font-medium">{lineCount.toLocaleString()}</span>
            <span className="text-xs opacity-75">lines</span>
          </div>
          
          <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <Clock className="h-4 w-4" />
            <span className="font-medium">{formatReadingTime(readingTime)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Writing Progress Bar */}
          <div className="flex items-center space-x-3">
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Progress
            </span>
            <div className={`w-24 h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className={`h-full rounded-full transition-all duration-300 ${getProgressColor(wordCount)} bg-current`}
                style={{ width: `${getProgressWidth(wordCount)}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${getProgressColor(wordCount)}`}>
              {Math.round(getProgressWidth(wordCount))}%
            </span>
          </div>
          
          {/* Performance Indicator */}
          <div className={`flex items-center space-x-2 px-2 py-1 rounded ${isDarkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
            <Zap className="h-3 w-3" />
            <span className="text-xs font-medium">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};
