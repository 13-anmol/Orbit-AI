import { Link } from "react-router-dom"
import "./homepage.css"
import { TypeAnimation } from "react-type-animation"
import { useState } from "react"

const HomePage = () => {
    const [typingStatus, setTypingStatus] = useState("human")

    return (
        <div className="homepage">
            <img src="/orbital.png" alt="" className="orbital" />
            <div className="left">
                <h1> OrbitAI </h1>
                <h2> Superchare your creativity and productivity </h2>
                <h3> This is an ai chat bot designed for good amount of productivity </h3>
                <Link to="/dashboard"> Get Started </Link>
            </div>

            <div className="right">
                <div className="imgContainer">
                    <div className="bgContainer">
                        <div className="bg"></div>
                    </div>
                    <img src="bot.png" alt="" className="bot" />
                    <div className="chat">
                        <img src={typingStatus === "human"
                            ? "/human1.jpeg"
                            : "bot.png"} alt="" />
                        <TypeAnimation
                            sequence={[
                                'Human: What is the largest planet in our Solar System?',
                                2000, () => {
                                    setTypingStatus("bot")
                                },
                                'Bot: Jupiter',
                                2000, () => {
                                    setTypingStatus("human")
                                },
                                'Human: Who wrote "Romeo and Juliet"? ',
                                2000, () => {
                                    setTypingStatus("bot")
                                },
                                'Bot: William Shakespeare',
                                2000, () => {
                                    setTypingStatus("human")
                                },
                            ]}
                            wrapper="span"
                            repeat={Infinity}
                            cursor={true}
                            omitDeletionAnimation={true}
                        />
                    </div>
                </div>
            </div>
            <div className="terms">
               <img src="/logo.png" alt=""/>
                <div className="links">
                    <Link to="/"> Terms of Service</Link>
                    <span> | </span>
                    <Link to="/"> Privacy Policy</Link>
                </div>
            </div>
        </div>
    )
}

export default HomePage

