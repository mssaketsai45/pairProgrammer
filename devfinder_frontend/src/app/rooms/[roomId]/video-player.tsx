"use client";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Room } from "@/db/schema";
import {
  Call,
  CallControls,
  CallParticipantsList,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState, useRef } from "react";
import { generateTokenAction } from "./actions";
import { useRouter } from "next/navigation";

const apiKey = process.env.NEXT_PUBLIC_GET_STREAM_API_KEY!;

// Global connection tracking to prevent duplicates across hot reloads
const globalConnections = new Map<string, { client: any; call: any }>();

export function DevFinderVideo({ room }: { room: Room }) {
  const session = useSession();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const router = useRouter();
  const isConnecting = useRef(false);

  useEffect(() => {
    // Only initialize video when user explicitly wants to join
    if (!room || !session.data || !isVideoActive) {
      return;
    }
    
    // Prevent multiple connections
    if (isConnecting.current) return;
    
    // Check if Stream.io credentials are properly configured
    if (!apiKey || apiKey === "1372398") {
      console.warn("Stream.io API key not properly configured. Video features will be disabled.");
      return;
    }
    
    const userId = session.data.user.id;
    const connectionKey = `${userId}_${room.id}`;
    
    // Check if we already have an active connection for this user+room
    const existingConnection = globalConnections.get(connectionKey);
    if (existingConnection) {
      console.log("Reusing existing connection");
      setClient(existingConnection.client);
      setCall(existingConnection.call);
      return;
    }
    
    isConnecting.current = true;
    
    try {
      const client = new StreamVideoClient({
        apiKey,
        user: {
          id: userId,
          name: session.data.user.name ?? undefined,
          image: session.data.user.image ?? undefined,
        },
        tokenProvider: () => generateTokenAction(),
      });
      
      const call = client.call("default", room.id);
      
      // Join with create: true and ring: false to avoid notifications
      call.join({ 
        create: true, 
        ring: false,
        notify: false 
      }).then(() => {
        console.log("Successfully joined call");
        // Store the connection globally
        globalConnections.set(connectionKey, { client, call });
        setClient(client);
        setCall(call);
        isConnecting.current = false;
      }).catch((error) => {
        console.error("Failed to join call:", error);
        isConnecting.current = false;
      });
      
    } catch (error) {
      console.error("Failed to initialize Stream.io video client:", error);
      isConnecting.current = false;
    }

    return () => {
      // Clean up on component unmount or page navigation
      isConnecting.current = false;
    };
  }, [session?.data?.user?.id, room?.id, isVideoActive]); // Add isVideoActive to dependencies

  // Clean up when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      if (session?.data?.user?.id && room?.id) {
        const connectionKey = `${session.data.user.id}_${room.id}`;
        const connection = globalConnections.get(connectionKey);
        if (connection) {
          connection.call.leave().catch(console.error);
          connection.client.disconnectUser().catch(console.error);
          globalConnections.delete(connectionKey);
        }
      }
    };
  }, [session?.data?.user?.id, room?.id]);

  // Show video start button if not active
  if (!isVideoActive) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 rounded-2xl border border-gray-700 shadow-lg">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-200 mb-3">Ready to collaborate?</h3>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto leading-relaxed">Start a video call when you&apos;re ready to pair program or discuss together</p>
            <button
              onClick={() => setIsVideoActive(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              🎥 Start Video Call
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading message if not configured properly
  if (!apiKey || apiKey === "1372398") {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 rounded-2xl border border-gray-700 shadow-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Video Chat Unavailable</h3>
          <p className="text-gray-400">Stream.io video service is not configured.</p>
        </div>
      </div>
    );
  }

  // Show loading state while connecting
  if (!client || !call) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 rounded-2xl border border-gray-700 shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-400">Connecting to video chat...</p>
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamTheme>
        <StreamCall call={call}>
            <SpeakerLayout />
            <CallControls
              onLeave={() => {
                router.push("/");
              }}
            />
            <CallParticipantsList onClose={() => undefined} />
          </StreamCall>
        </StreamTheme>
      </StreamVideo>
    );
}
