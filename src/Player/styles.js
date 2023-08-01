import { StyleSheet } from 'react-native';

export const getStyles = (theme) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            backgroundColor: theme.backgroundColor,
            justifyContent: 'center',
            alignItems: 'center',
        },
        controls: {
            flexDirection: 'row',
            marginTop: 20,
        },
        musicIconContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        radioName: {
            fontSize: 18,
            color: theme.textColor,
            fontWeight: 'bold',
            marginTop: 10,
        },
        audioName: {
            color: theme.textColor,
            marginTop: 10,
            fontSize: 16,
            paddingHorizontal: 50,
        },
        simpleText: {
            color: theme.textColor,
            marginTop: 10,
            paddingHorizontal: 50,
        },
    });
};