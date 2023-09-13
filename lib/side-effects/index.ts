import { Action } from "../game/action";
import { Store } from "../game/store";
import { generateAndUploadImage } from "../image-generation/api";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function sideEffect(gameStore: Store, action: Action) {
  switch (action.type) {
    case "guess": {
      const image = await generateAndUploadImage(action.payload.guess);

      // Send image to players
      gameStore.dispatch({
        type: "join",
        payload: {
          playerName: image.imageUrl,
        },
      });
    }
  }
}
