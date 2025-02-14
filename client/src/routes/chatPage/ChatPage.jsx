import { useEffect, useRef } from "react";
import "./chatPage.css";
import NewPrompt from "../../components/newPrompt/NewPrompt";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import { IKImage } from "imagekitio-react";

const ChatPage = () => {
	const path = useLocation().pathname;
	const chatId = path.split("/").pop();
	const navigate = useNavigate();

	const { isPending, error, data } = useQuery({
		queryKey: ["chat", chatId],
		queryFn: () =>
			fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
				credentials: "include",
			}).then((res) => res.json()),
	});

	console.log(data.history.parts[0]);
	console.log(data.history.role);

	const handleDelete = async () => {
		if (window.confirm("Are you sure you want to delete this chat?")) {
			try {
				const res = await fetch(
					`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`,
					{
						method: "DELETE",
						credentials: "include",
						header: {
							"Content-Type": "application/josn",
						},
					}
				);
				if (res.ok) {
					navigate("/dashboard");
					navigate(0);
				} else {
					console.error("Failed to delete:", res.status);
				}
			} catch (error) {
				console.log(error);
			}
		} else {
			this.onCancel();
		}
	};

	return (
		<div className="chatPage">
			<div className="wrapper">
				<div className="chat">
					{isPending
						? "Loading..."
						: error
						? "Something went wrong"
						: data?.history?.map((message, i) => (
								<>
									{message.img && (
										<IKImage
											urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
											path={message.img}
											height="300"
											width="400"
											transformation={[{ height: 300, width: 400 }]}
											loading="lazy"
											lqip={{ active: true, quality: 20 }}
										/>
									)}
									<div
										key={i}
										className={
											message.role === "user" ? "message user" : "message"
										}
									>
										<Markdown>{message.parts[0].text}</Markdown>
									</div>
								</>
						  ))}

					{data && <NewPrompt data={data} />}
				</div>
				<button className="bin" onClick={handleDelete}>
					<img src="/delete.svg" />
				</button>
			</div>
		</div>
	);
};
export default ChatPage;
