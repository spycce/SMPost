
import React, { useEffect, useState } from 'react';
import { Card, Badge, Button } from '../components/UIComponents';
import { ApiService } from '../services/apiService';
import { Post } from '../types';
import { PLATFORM_ICONS } from '../constants';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const Scheduler: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentDate] = useState(new Date());

  useEffect(() => {
    ApiService.getPosts().then(setPosts);
  }, []);

  // Mock Calendar Logic for display (Static Current Month)
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const calendarDays = getDaysInMonth();
  // Pad start
  const startDay = calendarDays[0].getDay();
  const blanks = Array(startDay).fill(null);

  const getPostsForDate = (date: Date) => {
    // Check if a post is scheduled for this specific date
    return posts.filter(post => {
      const postDate = new Date(post.scheduledDate || post.createdAt);
      return postDate.getDate() === date.getDate() &&
        postDate.getMonth() === date.getMonth() &&
        postDate.getFullYear() === date.getFullYear();
    });
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
          <p className="text-sm text-gray-500">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm">Day</Button>
          <Button variant="secondary" size="sm">Week</Button>
          <Button variant="primary" size="sm">Month</Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {DAYS.map(day => (
            <div key={day} className="py-2 text-center text-sm font-semibold text-gray-700 bg-gray-50">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-gray-200 gap-px border-b border-gray-200">
          {blanks.map((_, i) => <div key={`blank-${i}`} className="bg-white" />)}
          {calendarDays.map(date => {
            const dayPosts = getPostsForDate(date);
            return (
              <div key={date.toISOString()} className="bg-white min-h-[120px] p-2 hover:bg-gray-50 transition-colors">
                <span className={`text-sm font-medium ${date.toDateString() === new Date().toDateString() ? 'bg-brand-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-900'}`}>
                  {date.getDate()}
                </span>
                <div className="mt-2 space-y-1">
                  {dayPosts.map((post, i) => (
                    <div key={i} className="text-xs p-1 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 truncate cursor-pointer hover:bg-indigo-100">
                      {PLATFORM_ICONS[post.platform]} {post.content.substring(0, 15)}...
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  );
};
