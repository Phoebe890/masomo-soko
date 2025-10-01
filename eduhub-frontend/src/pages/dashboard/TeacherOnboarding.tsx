import React from 'react';
export default function TeacherOnboarding({ onComplete }: { onComplete: () => void }) {
  return (
    <div>
      <h2>Teacher Onboarding</h2>
      <button onClick={onComplete}>Complete Onboarding</button>
    </div>
  );
} 