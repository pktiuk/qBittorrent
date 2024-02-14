# Base image
FROM ubuntu:23.10

# Install required packages
RUN apt-get update && apt-get install -y apt-utils
RUN apt install -y \
    build-essential cmake ninja-build gdb \
    libssl-dev libxkbcommon-x11-dev libxcb-cursor-dev zlib1g-dev
RUN apt-get install -y build-essential libgl1-mesa-dev libglib2.0-0 libdbus-1-3
RUN apt-get install '^libxcb.*-dev' libx11-xcb-dev libglu1-mesa-dev libxrender-dev libxi-dev libxkbcommon-dev libxkbcommon-x11-dev
# Install Qt 6
RUN apt-get install -y python3 python3-pip
RUN pip3 install --break-system-packages aqtinstall
RUN mkdir /tmp/qt && \
    aqt install-qt linux desktop 6.5.3 --autodesktop -O /tmp/qt && \
    cp -r /tmp/qt/6.5.3/gcc_64/** /usr/local/

# get boost
RUN apt-get install -y git curl
# RUN apt install -y libboost-all-dev
RUN boost_url="https://boostorg.jfrog.io/artifactory/main/release/1.76.0/source/boost_1_76_0.tar.gz" && \
    mkdir -p "/workspace/boost/"  && \
    curl -L -o /tmp/boost.tar.gz "$boost_url" && \
    tar -xf "/tmp/boost.tar.gz" -C "/workspace/boost" && \
    ls /workspace/boost/

# Compile libtorrent
RUN git clone \
    --branch v2.0.9 \
    --depth 1 \
    --recurse-submodules \
    https://github.com/arvidn/libtorrent.git \
    workspace/libtorrent
RUN mkdir -p /workspace/libtorrent/build
RUN ls /workspace/boost
RUN cd workspace/libtorrent/build && \
    cmake -GNinja -DCMAKE_BUILD_TYPE=Release \
    -DBOOST_ROOT=/workspace/boost -DCMAKE_INSTALL_PREFIX=/usr/local .. && \
    ninja && \
    ninja install



# Set the working directory
WORKDIR /workspace/

# Copy the necessary files to the container
# COPY . /workspace/qbittorrent

# QT w roocie
# RUN export PATH=/6.5.3/gcc_64/bin:$PATH && \

# RUN cmake -B build -DBOOST_ROOT=/workspace/boost -DCMAKE_BUILD_TYPE=Release

#docker build --tag qbit .
#xhost +local:
#docker container run -it -v /tmp/.X11-unix:/tmp/.X11-unix -e DISPLAY -v./:/workspace/qbittorrent qbit