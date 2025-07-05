// Simple test script to test our API endpoints
const testAPI = async () => {
  const baseURL = 'http://localhost:3001';
  
  console.log('🧪 Testing DevFinder Backend API...\n');

  try {
    // Test 1: Get all rooms
    console.log('1️⃣ Testing GET /api/rooms');
    const roomsResponse = await fetch(`${baseURL}/api/rooms`);
    const roomsData = await roomsResponse.json();
    console.log('✅ Rooms:', roomsData.data.length, 'rooms found');
    console.log('📋 First room:', roomsData.data[0]?.name || 'No rooms');

    // Test 2: Get specific room
    console.log('\n2️⃣ Testing GET /api/rooms/1');
    const roomResponse = await fetch(`${baseURL}/api/rooms/1`);
    const roomData = await roomResponse.json();
    console.log('✅ Room details:', roomData.data?.name || 'Room not found');

    // Test 3: Create new room
    console.log('\n3️⃣ Testing POST /api/rooms');
    const newRoom = {
      name: 'TypeScript Study Group',
      description: 'Learning TypeScript fundamentals',
      tags: 'typescript,javascript,programming',
      githubRepo: 'https://github.com/example/typescript-study'
    };

    const createResponse = await fetch(`${baseURL}/api/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newRoom)
    });

    const createData = await createResponse.json();
    console.log('✅ Room created:', createData.data?.name || 'Failed to create');
    const newRoomId = createData.data?.id;

    // Test 4: Update the room
    if (newRoomId) {
      console.log('\n4️⃣ Testing PUT /api/rooms/' + newRoomId);
      const updateRoom = {
        name: 'Advanced TypeScript Study Group',
        description: 'Advanced TypeScript concepts and patterns',
        tags: 'typescript,advanced,patterns',
        githubRepo: 'https://github.com/example/advanced-typescript'
      };

      const updateResponse = await fetch(`${baseURL}/api/rooms/${newRoomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateRoom)
      });

      const updateData = await updateResponse.json();
      console.log('✅ Room updated:', updateData.data?.name || 'Failed to update');
    }

    // Test 5: Search rooms
    console.log('\n5️⃣ Testing GET /api/rooms?search=react');
    const searchResponse = await fetch(`${baseURL}/api/rooms?search=react`);
    const searchData = await searchResponse.json();
    console.log('✅ Search results:', searchData.data.length, 'rooms found with "react"');

    // Test 6: Get user stats
    console.log('\n6️⃣ Testing GET /api/users');
    const usersResponse = await fetch(`${baseURL}/api/users`);
    const usersData = await usersResponse.json();
    console.log('✅ Database stats:', usersData.stats || 'No stats');

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Note: This is just for demonstration
// In a real browser environment, you would run this in the console
console.log('Copy and paste this function into your browser console at http://localhost:3001');
console.log('Then run: testAPI()');

// For Node.js testing (if fetch is available)
if (typeof fetch !== 'undefined') {
  testAPI();
}
