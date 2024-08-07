import { Link } from "react-router-dom";
import "./homepage.css";
import { TypeAnimation } from "react-type-animation";
import { useState } from "react";

const Homepage = () => {
	const [typingStatus, setTypingStatus] = useState("human1");

	// const test = async () => {
	// 	await fetch("http://localhost:3000/api/tests", {
	// 		credentials: "include",
	// 	});
	// };

	return (
		<div className="homepage">
			<img src="/orbital.png" alt="" className="orbital" />
			<div className="left">
				<h1>KS AI</h1>
				<h2>Boost your creativity and productiviy with KS AI</h2>
				<h3>The world is changing. Are you changing??</h3>
				<Link to="/dashboard">Get Started</Link>
			</div>
			<div className="right">
				<div className="imgContainer">
					<div className="bgContainer">
						<div className="bg"></div>
					</div>
					<img src="/bot.png" alt="" className="bot" />
					<div className="chat">
						<img
							src={
								typingStatus === "human1"
									? "/human1.jpeg"
									: typingStatus === "human2"
									? "human2.jpeg"
									: "/bot.png"
							}
							alt=""
						/>
						<TypeAnimation
							sequence={[
								"Human: Hi, can I ask you some questions??",
								2000,
								() => {
									setTypingStatus("bot");
								},
								"Bot: Of course! What would you like to know???",
								2000,
								() => {
									setTypingStatus("human2");
								},
								"Human2: Wait!! Me first!",
								2000,
								() => {
									setTypingStatus("bot");
								},
								"Bot: Please line up!!!",
								2000,
								() => {
									setTypingStatus("human1");
								},
							]}
							wrapper="span"
							cursor={true}
							omitDeletionAnimation={true}
							repeat={Infinity}
						/>
					</div>
				</div>
			</div>
			<div className="terms">
				<img src="/logo.png" alt="" />
				<div className="links">
					<Link to="/">Terms of Services</Link>
					<Link to="/">Private Policy</Link>
				</div>
			</div>
		</div>
	);
};
export default Homepage;
