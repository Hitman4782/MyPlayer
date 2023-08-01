import { StyleSheet } from 'react-native';

export const getStyles = (theme) => {
    
    return StyleSheet.create({
        container: {
            flex: 1,
            padding: 16,
            backgroundColor: theme.backgroundColor,
        },
        addButton: {
            position: 'absolute',
            right: 20,
            bottom: 20,
            backgroundColor: theme.addButtonColor,
            borderRadius: 50,
            width: 50,
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
        },
        searchContainer: {
            paddingBottom: 10,
        },
        listContainer: {
            paddingBottom: 16,
        },
        card: {
            backgroundColor: theme.cardBackground,
            padding: 16,
            marginBottom: 16,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        radioInfo: {
            flex: 1,
        },
        Title: {
            fontSize: 18,
            bottom: 5,
            textAlign: 'center',
            color: theme.textColor,
            fontWeight: 'bold',
            paddingBottom: 5,
        },
        cardName: {
            fontSize: 18,
            color: theme.textColor,
            fontWeight: 'bold',
        },
        cardLocation: {
            fontSize: 14,
            color: theme.textColor,
        },
        dots: {
            fontSize: 24,
            color: '#CCCEDE',
            paddingHorizontal: 8,
        },
        modalBackground: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContainer: {
            backgroundColor: theme.backgroundColor,
            borderRadius: 8,
            padding: 16,
            width: '80%',
        },
        modalHeader: {
            alignItems: 'center',
            marginBottom: 16,
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.textColor,
        },
        iconContainer: {
            marginLeft: 8,
        },
        modalContent: {
            marginBottom: 16,
        },
        input: {
            borderWidth: 1,
            borderColor: '#CCC',
            borderRadius: 4,
            marginBottom: 12,
            padding: 8,
            color: theme.textColor,
        },
        Button: {
            backgroundColor: '#f1304d',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 5,
            marginBottom: 5,
        },
        ButtonText: {
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: 'bold',
        },
        themeToggle: {
            position: 'absolute',
            top: 10,
            right: 10,
            padding: 8,
            borderRadius: 8,
            backgroundColor: '#f1304d',
        },
        themeToggleText: {
            color: 'white',
        },
    });
};