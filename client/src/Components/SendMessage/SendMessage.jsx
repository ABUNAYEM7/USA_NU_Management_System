import React, { useState, useEffect } from "react";
import Select from "react-select";
import useAuth from "../Hooks/useAuth";
import { MdMessage } from "react-icons/md";
import useUserRole from "../Hooks/useUserRole";
import AxiosSecure from "../Hooks/AxiosSecure";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router";

const SendMessage = () => {
  const { user } = useAuth();
  const { data } = useUserRole();
  const userRole = data?.data?.role;
  const axiosInstance = AxiosSecure();
  const { id } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [roleOptions, setRoleOptions] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [isReplyMode, setIsReplyMode] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ new state

  useEffect(() => {
    if (userRole === "admin") {
      setRoleOptions(["faculty", "student"]);
    } else if (userRole === "faculty") {
      setRoleOptions(["admin", "student"]);
    } else if (userRole === "student") {
      setRoleOptions(["admin", "faculty"]);
    }
  }, [userRole]);

  useEffect(() => {
    if (id) {
      setIsReplyMode(true);
      axiosInstance
        .get(`/message/${id}`)
        .then((res) => {
          const original = res.data;
          setSelectedRole(original.recipientRole);
          setSelectedRecipients([{ label: original.email, value: original.email }]);
          setSubject("Re: " + original.subject);
        })
        .catch((err) => console.error("Failed to load message for reply", err));
    }
  }, [id, axiosInstance]);

  useEffect(() => {
    if (selectedRole && !isReplyMode) {
      axiosInstance
        .get(`/all-users?role=${selectedRole}`)
        .then((res) => {
          const userList = res?.data?.users || [];
          setRecipients(userList);

          if (sendToAll) {
            const allOptions = userList.map((r) => ({
              label: `${r.name} (${r.email})`,
              value: r.email,
            }));
            setSelectedRecipients(allOptions);
          }
        })
        .catch((err) => console.error("Failed to load recipients", err));
    }
  }, [selectedRole, sendToAll, axiosInstance, isReplyMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedRecipients.length === 0) {
      Swal.fire("Error", "Please select at least one recipient", "error");
      return;
    }

    setIsSubmitting(true); // ✅ disable button
    try {
      const formData = new FormData();
      formData.append("name", user?.displayName);
      formData.append("email", user?.email);
      formData.append("subject", subject);
      formData.append("description", description);
      formData.append("recipientRole", selectedRole);
      formData.append("replyTo", id || "");
      selectedRecipients.forEach((r) => formData.append("recipients", r.value));
      if (pdfFile) formData.append("file", pdfFile);

      const res = await axiosInstance.post("/send-message", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.insertedId) {
        Swal.fire("Success", "Message sent successfully", "success");
        navigate("/dashboard/message");
      }
    } catch (err) {
      console.error("Message send failed", err);
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setIsSubmitting(false); // ✅ re-enable button
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 bg-gradient-to-tr from-white to-blue-50 shadow-2xl rounded-2xl p-10 border border-prime">
      <div className="flex items-center justify-center mb-8">
        <MdMessage className="text-4xl text-prime mr-2" />
        <h2 className="text-3xl font-bold text-gray-800">
          {isReplyMode ? "Reply Message" : "Send a Message"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="label">
            <span className="label-text">Your Name</span>
          </label>
          <input
            type="text"
            readOnly
            value={user?.displayName || ""}
            className="input w-full border border-prime bg-gray-100 text-gray-700"
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">Email Address</span>
          </label>
          <input
            type="email"
            readOnly
            value={user?.email || ""}
            className="input w-full border border-prime bg-gray-100 text-gray-700"
          />
        </div>

        {!isReplyMode && (
          <div>
            <label className="label">
              <span className="label-text">Send To Role</span>
            </label>
            <select
              className="select select-bordered w-full border-prime"
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setSendToAll(false);
                setSelectedRecipients([]);
              }}
              required
            >
              <option disabled value="">
                -- Select Role --
              </option>
              {roleOptions.map((role) => (
                <option key={role} value={role.toLowerCase()}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        {!isReplyMode && selectedRole && (
          <div className="form-control">
            <label className="cursor-pointer label justify-start gap-4">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={sendToAll}
                onChange={(e) => {
                  setSendToAll(e.target.checked);
                  if (e.target.checked) {
                    const allOptions = recipients.map((r) => ({
                      label: `${r.name} (${r.email})`,
                      value: r.email,
                    }));
                    setSelectedRecipients(allOptions);
                  } else {
                    setSelectedRecipients([]);
                  }
                }}
              />
              <span className="label-text text-gray-700">
                Send to all {selectedRole}s
              </span>
            </label>
          </div>
        )}

        {!isReplyMode && recipients.length > 0 && (
          <div>
            <label className="label">
              <span className="label-text">
                Select Recipients {sendToAll && "(All pre-selected, you can remove any)"}
              </span>
            </label>
            <Select
              isMulti
              options={recipients.map((r) => ({
                label: `${r.name} (${r.email})`,
                value: r.email,
              }))}
              value={selectedRecipients}
              onChange={setSelectedRecipients}
              className="text-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#3B82F6",
                  padding: "2px",
                }),
              }}
            />
          </div>
        )}

        {isReplyMode && (
          <div>
            <label className="label">
              <span className="label-text">To</span>
            </label>
            <input
              type="text"
              readOnly
              value={selectedRecipients[0]?.label || ""}
              className="input w-full border border-prime bg-gray-100 text-gray-700"
            />
          </div>
        )}

        <div>
          <label className="label">
            <span className="label-text">Subject</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Feedback, Request, Query"
            className="input w-full border border-prime"
            required
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">Message</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your message here..."
            className="textarea w-full border border-prime min-h-[130px]"
            required
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">Attach PDF (optional)</span>
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files[0])}
            className="file-input file-input-bordered w-full"
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn bg-prime text-white px-10 tracking-wide shadow-lg transition-all duration-200 ease-in-out ${
              isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:scale-105"
            }`}
          >
            <MdMessage className="mr-2 text-lg" />{" "}
            {isReplyMode ? "Reply" : isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendMessage;
