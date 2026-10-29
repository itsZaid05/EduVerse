import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") nickname = "";
  @type("string") role = "student"; // student | teacher
  @type("string") zone = "campus";
  @type("number") x = 0; @type("number") y = 1.6; @type("number") z = 8;
  @type("number") rotY = 0;
  @type("number") score = 0;
  @type("number") attempts = 0;
  @type("string") discoveries = ""; // csv of heritage hotspot ids this player found
  @type("boolean") connected = true;
}

export class ClassState extends Schema {
  @type("string") code = "";
  @type("string") activity = "lobby"; // lobby | math | science | heritage | summary
  @type("number") teamScore = 0;
  @type("number") elapsedStart = 0;
  // Math
  @type("string") mathPlaced = ""; // csv piece ids
  @type("number") mathAttempts = 0;
  @type("boolean") mathComplete = false;
  @type("number") mathHint = 0;
  // Science
  @type("string") sciencePlaced = ""; // csv atomId=slotId
  @type("number") scienceAttempts = 0;
  @type("boolean") scienceComplete = false;
  @type("number") scienceHint = 0;
  // Heritage
  @type("string") heritageFound = ""; // csv hotspot ids (team-shared)
  @type("number") heritageAttempts = 0;
  @type("number") heritageHint = 0;
  @type("string") announcement = "";
  @type({ map: Player }) players = new MapSchema<Player>();
  @type(["string"]) feed = new ArraySchema<string>();
  @type(["string"]) chat = new ArraySchema<string>();
}
