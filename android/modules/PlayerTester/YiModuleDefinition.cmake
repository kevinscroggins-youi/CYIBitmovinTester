include(${YouiEngine_DIR}/cmake/Modules/android/YiModuleUtilities.cmake)

get_filename_component(_PROJECT_DIR ${CMAKE_CURRENT_LIST_DIR}/../../.. ABSOLUTE)

option(YI_ENABLE_CLEARTEXT "When set to ON the 'android:usesCleartextTraffic attribute=true' will be added to Android Manifest." ON)

yi_define_module(PlayerTester
    TYPE APPLICATION
    PROJECT_DIR ${_PROJECT_DIR}
    VARIABLES
        "YI_PROJECT_NAME=PlayerTester"
        "YI_PACKAGE_NAME=tv.youi.playertester"
        "YI_DISPLAY_NAME=\"Player Tester\""
        "YI_BUILD_NUMBER=1"
        "YI_VERSION_NUMBER=1.0.0"
)
