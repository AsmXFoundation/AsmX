#================================================================
# Creating a Linux distribution
#================================================================
@import shell;
@import gpu;

@using subprogram build_distribution;
@using subprogram parameters_iso_distribution;
@using subprogram liscense_distribution;

@execute goto_sbp parameters_iso_distribution;
@execute goto_sbp build_distribution;

#================================================================
# Directories for distribution
#================================================================
@define DIRECTORY_ETC "etc";
@define DIRECTORY_BOOTLOADER "boot";
@define DIRECTORY_USER "usr";
@define DIRECTORY_BIN "bin";
@define DIRECTORY_SBIN "sbin";
@define DIRECTORY_ROOT "root";
@define DIRECTORY_DEV "dev";
@define DIRECTORY_LIB "lib";
@define DIRECTORY_MEDIA "media";
@define DIRECTORY_OPTIONS "opt";
@define DIRECTORY_TMP "tmp";
@define DIRECTORY_PROCESS "proc";
@define DIRECTORY_HOME "home";
@define DIRECTORY_SERVER "srv";
@define DIRECTORY_VAR "var";
@define DIRECTORY_RUN "run";
#================================================================


#================================================================
# Input parameters for building distribution
#================================================================
@subprogram parameters_iso_distribution:
    @call input("dist name: ");
    @set DistributionName String $RETURN;
    @call print("Valid distribution name: vX.X" - X - Int.");
    @call input("dist version: ");
    @set DistributionVersion String $RETURN;
    @call input("dist author: ");
    @set DistributionAuthor String $RETURN;

@subprogram build_distribution:
    @call log("ISO Build", YELLOW, "build iso for distribution Linux\n");


@subprogram liscense_distribution:
    @define LISCENSE_DISTRIBUTION_NAME "MIT License";