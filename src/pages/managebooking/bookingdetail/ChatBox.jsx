import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import toast from "react-hot-toast";

const ChatBox = ({ bookingId, user, messageData, onSend,isMsgSending }) => {
  const [newMsg, setNewMsg] = useState("");
  const maxMessages = 5;

  const formatDateTime = (datetime) => {
    if (!datetime) return "";
    const date = new Date(datetime);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  

  const handleSend = () => {
    
   
       if (!newMsg || newMsg.trim() === "") {
    toast.error("Enter a message before sending");
    return;
  }if (messageData.length > maxMessages) {
    toast.error("Maximum message limit reached");
    return;
  }
   if (newMsg.trim() && messageData.length < maxMessages) {
      onSend(newMsg.trim(), bookingId);
      setNewMsg("");
    }
  };

  const isAllowedUser =
    user?.fld_admin_type === "SUBADMIN" ||
    user?.fld_admin_type === "CONSULTANT" ||
    user?.fld_admin_type === "EXECUTIVE";

  return (
    <div className="bg-white  border border-gray-200  rounded-md p-4 w-[50%] mt-6">
      <div className="flex items-center gap-2 mb-3 pb-2">
        <MessageCircle className="text-gray-700" />
        <h5 className="font-semibold text-gray-700 text-lg">Chat</h5>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-4 p-1 px-2 bg-white border border-gray-200 rounded-sm" id="messagebox">
        {messageData.length === 0 ? (
          <p className="text-gray-500 text-sm">No messages yet.</p>
        ) : (
          messageData.map((msg, idx) => {
            const isSender = msg.fld_sender_id === user.id;

            return (
              <div
                key={idx}
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-md px-4 py-3 rounded-lg text-sm shadow ${
                    isSender
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white border text-gray-800 rounded-bl-none"
                  }`}
                >
                  {!isSender && (
                    <div className="text-xs font-semibold text-gray-500 mb-1">
                      {msg.sender_name}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{msg.fld_message}</div>
                  <div className="text-[11px] text-right mt-1 text-gray-300">
                    {formatDateTime(msg.fld_addedon)}
                    {msg.fld_read_time && (
                      <div className="italic mt-1 text-right">
                        Read Time: {formatDateTime(msg.fld_read_time)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isAllowedUser && (
        <div className="mt-2  pt-3">
          {messageData.length < maxMessages ? (
            <div className="flex gap-2 items-end">
              <textarea
                rows={1}
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded p-1 px-2 text-[13px] resize-none "
              />
              <button
                onClick={handleSend}
                disabled={isMsgSending}
                className={`${isMsgSending? "bg-[#ff6800]" : "bg-[#ff6800]"} text-white px-3 py-1  rounded flex`}
              >
                {isMsgSending ?"Sending...":"Send"}<Send size={15}/>
              </button>
            </div>
          ) : (
            <div className="text-sm text-red-600">
              Total 5 messages can be shared
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBox;
