import { TagsList } from "@/components/tags-list";
import { getRoom } from "@/data-access/rooms";
import { GithubIcon } from "lucide-react";
import Link from "next/link";
import { DevFinderVideo } from "./video-player";
import { RoomChat } from "@/components/room-chat";
import { splitTags } from "@/lib/utils";
import { unstable_noStore } from "next/cache";

export default async function RoomPage(props: { params: { roomId: string } }) {
  unstable_noStore();
  const roomId = props.params.roomId;

  const room = await getRoom(roomId);

  if (!room) {
    return <div>No room of this ID found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="grid grid-cols-1 min-h-screen gap-6 p-6">
        {/* Main Content Area - Full Width */}
        <div className="space-y-6">
          {/* Room Info */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <h1 className="text-3xl font-bold">{room?.name}</h1>
                  <p className="text-purple-100 text-lg leading-relaxed">{room?.description}</p>
                  <div className="pt-2">
                    <TagsList tags={splitTags(room.tags)} />
                  </div>
                </div>
                {room.githubRepo && (
                  <Link
                    href={room.githubRepo}
                    className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200 text-white backdrop-blur-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GithubIcon size={18} />
                    <span className="font-medium">GitHub</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Video Call Area */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-6">
            <DevFinderVideo room={room} />
          </div>
        </div>
      </div>
      
      {/* Floating Room Chat */}
      <RoomChat roomId={roomId} />
    </div>
  );
}
