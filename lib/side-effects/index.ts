import { Action } from "../game/action";
import { Store } from "../game/store";
import { generateAndUploadImage } from "../image-generation/api";

export default async function sideEffect(gameStore: Store, action: Action) {
  switch (action.type) {
    case "guess": {
      const {imageUrl} = await generateAndUploadImage(action.payload.guess);

      // Send image to players
      gameStore.dispatch({
        type: "image-generated",
        payload: {
          image: imageUrl,
        }
      });
    }
  }
}
