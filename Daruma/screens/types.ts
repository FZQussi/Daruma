// This file contains the types for your navigation

// Define the param list for each screen in your stack
export type RootStackParamList = {
    Login: undefined;  // No parameters for Login screen
    EmailLogin: undefined;  // No parameters for EmailLogin screen
    PhoneLogin: undefined;  // No parameters for PhoneLogin screen
    RegistrationStep1: undefined;  // No parameters for RegistrationStep1 screen
    Home: undefined;  // No parameters for Home screen
    ChatScreen: { chatRoomId: string };  // Expect a chatRoomId parameter in ChatScreen
    ChatQueue: undefined;  // No parameters for ChatQueue screen
    MatchScreen: undefined;
    MatchChats: { matchId: string };
    MatchList: undefined;
  };
