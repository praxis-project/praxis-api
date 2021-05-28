import { Typography } from "@material-ui/core";
import Link from "next/link";
import { Motions, Groups } from "../../constants";
import baseUrl from "../../utils/baseUrl";
import Messages from "../../utils/messages";

interface TextProps {
  text: string;
  data: string | undefined;
}

const Text = ({ text, data }: TextProps) => {
  return (
    <Typography
      style={{
        color: "rgb(190, 190, 190)",
      }}
    >
      <span
        style={{
          fontFamily: "Inter Bold",
        }}
      >
        {Messages.motions.groups.proposedAspect(text)}
      </span>
      {" " + data}
    </Typography>
  );
};

const ActionData = ({ motion }: { motion: Motion }) => {
  const { id, action, actionData } = motion;
  if (action === Motions.ActionTypes.ChangeName)
    return <Text text={Groups.Aspects.Name} data={actionData.newGroupName} />;

  if (action === Motions.ActionTypes.ChangeDescription)
    return (
      <Text
        text={Groups.Aspects.Description}
        data={actionData.newGroupDescription}
      />
    );

  if (action === Motions.ActionTypes.ChangeImage)
    return (
      <>
        <div
          style={{
            fontFamily: "Inter Bold",
            color: "rgb(190, 190, 190)",
            marginBottom: 2,
          }}
        >
          {Messages.motions.groups.proposedAspect(Groups.Aspects.Image)}
        </div>
        <Link href={`/motions/${id}`}>
          <a>
            <img
              src={baseUrl + actionData.newGroupImagePath}
              alt={Messages.images.couldNotRender()}
              style={{
                width: "60%",
                display: "block",
              }}
            />
          </a>
        </Link>
      </>
    );

  return <></>;
};

export default ActionData;
