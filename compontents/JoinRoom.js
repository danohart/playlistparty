import CodeInput from "@/compontents/CodeInput";

export default function JoinRoom({ handleRoomChange, roomNumber }) {
  return (
    <div>
      <label className="flow-field-label">Room code</label>
      <CodeInput
        value={roomNumber ? String(roomNumber) : ""}
        onChange={(v) => handleRoomChange({ target: { value: v } })}
        length={5}
      />
    </div>
  );
}
