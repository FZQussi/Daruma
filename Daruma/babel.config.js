module.exports = {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',  // Se estiver usando animações com react-native-reanimated
      ['module:react-native-dotenv']    // Plugin para variáveis de ambiente com react-native-dotenv
    ],
  };
  