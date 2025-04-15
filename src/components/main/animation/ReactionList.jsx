import ReactionButton from "./ReactionButton";
import Like from "../../../assets/animations/like.json";
import Haha from "../../../assets/animations/haha.json";
import Sad from "../../../assets/animations/sad.json";
import Angry from "../../../assets/animations/angry.json";
import Love from "../../../assets/animations/love.json";
import Wow from "../../../assets/animations/wow.json";

export const reactions = [
    { name: "Like", animation: Like },
    { name: "Love", animation: Love },
    { name: "Haha", animation: Haha },
    { name: "Sad", animation: Sad },
    { name: "Wow", animation: Wow },
    { name: "Angry", animation: Angry },
];

const ReactionList = ({
  handleMouseEnter,
  handleMouseLeave,
  onSelectReaction,
}) => {
  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`flex gap-2   bottom-full left-0 bg-white rounded-2xl px-4 py-2 shadow-2xl animate__animated animate__zoomInLeft animate__faster`}
    >
      {reactions.map((reaction, index) => (
        <ReactionButton
          key={index}
          animationData={reaction.animation}
          onClick={() => onSelectReaction(reaction)}
        />
      ))}
    </div>
  );
};

export default ReactionList;
