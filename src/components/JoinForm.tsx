import type { FormEvent } from "react";

interface JoinFormProps {
  name: string;
  roomId: string;
  onNameChange: (value: string) => void;
  onRoomIdChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export function JoinForm({
  name,
  roomId,
  onNameChange,
  onRoomIdChange,
  onSubmit,
}: JoinFormProps) {
  return (
    <form className="join-form" onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />
      <input
        type="text"
        placeholder="Room ID (e.g. room1)"
        value={roomId}
        onChange={(e) => onRoomIdChange(e.target.value)}
      />
      <button type="submit">Join / Create Room</button>
    </form>
  );
}
