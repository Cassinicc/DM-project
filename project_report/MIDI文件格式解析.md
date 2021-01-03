# MIDI文件格式解析



​		MIDI文件是二进制文件，其内部主要记录了乐曲播放时，音序器应发送给音源的MIDI指令和每条指令发送的时间点。音序器读取这些时间信息和MIDI指令，通过在相应的时间发送相应的指令，以实现乐曲中音符的顺序播放和节拍信息。除了音序器需要发送的MIDI事件之外，MIDI文件内部也记录了一些辅助信息，如版权信息、音轨名、速度信息、拍号、调号等等，这些信息被称为Meta-event，只用于记录一些曲子的信息，通常并不发送给MIDI系统中的其他设备。



​		Midi是由一种名为“Chunk”的数据结构构成的，每个chunk由最初4字节的“Chunk类型”，紧接着4字节的“Chunk大小”（描述的是“Chunk 数据”的长度，而不是整个Chunk的长度。），和最后长度可变的“Chunk数据”构成。

​		构成MIDI文件的Chunk主要有两种类型：一种是Header Chunk（MThd），另一种是Track Chunk（MTrk）。

​		Header Chunk位于整个MIDI文件的起始处，是必须存在的，其起始标记就是ASCII码形式的“MThd”字符串。Track Chunk的起始标记，依然是ASCII码形式的“MTrk”字符串，并且Track Chunk整块分布于MIDI文件之中的任何位置，数量也不定，从1块到若干块皆可。实际上一个MIDI文件就是由一个Header Chunk和若干Track Chunk组成。读者若使用一个十六进制编辑软件（如UltraEdit）打开并查看一个MIDI文件时，便能找到这两部分。







#### 3.1.1 MThd

MThd也就是Header Chunk，它位于整个MIDI文件的起始处，在每个 Midi 文件的开头都有如下内容：
`4d54 6864 0000 0006 ffff nnnn dddd`
其中：

1. `4d54 6864`是ACSII表示的“MThd”字符串，表示构成MIDI文件的Chunk类型是文件头（Header Chunk）。
2. `0000 0006`是MThd中数据部分的长度，以目前标准均为6字节，也就是接下来的`ffff nnnn dddd`。
3. `ffff`制定Midi文件的格式，具体数据及对应含义如下图所示。
4. `nnnn`值表示文件中有多少个MTrk块。对于MIDI 0格式文件，`nnnn`值仅为0001，即只有一个Track Chunk；MIDI 1格式文件则可以有多个Track Chunk，而且Track Chunk数目为实际的音轨数目加一。
5. `dddd`值多采用TPQN时间度量法。TPQN是“Ticks Per Quarter-Note（每四分音符中所包含的Midi Tick数量）”的缩写，可以是十进制的60-480之间，**数值越大，MIDI系统的时间分辨率就越大，也就是说可以演奏时值越小的音符**。通常这个数都采用120、240、480，因为这些数都能被2、3、4甚至6、8整除，方便于八分音符、十六分音符、三连音甚至更短音符的演奏，换算成十六进制，就是0x78、0xF0、0x1E0。当然注意，这些十六进制数的最高位都是0。`dddd`值如果大于0x8000，则为SMPTE时间码度量法，这里不详细介绍了。

![img](https://upload-images.jianshu.io/upload_images/15561067-399456bc0d0c10e1.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp)





#### 3.1.2 MTrk

MTrk（也就是Track Chunk）内部则包含了实际的MIDI信息和一些辅助信息，如版权信息、音轨名、速度信息、拍号、调号等等。

我们以下面这个Midi文件的数据为例：

```undefined
4d54 6864 0000 0006 0000 0001 0064 4d54
726b 0000 03a9 00c0 0000 903c 5a00 903f
5a00 9043 5a00 9048 5a78 803f 0000 904b
5a78 803c 0000 8043 0000 8048 0000 9037
5a00 9046 5a78 8037 0000 8046 0000 9038
5a00 9048 5a00 904d 5a78 8038 0000 8048
0000 804b 0000 903a 5a00 9046 5a00 904a
5a78 803a 0000 804a 0000 804d 0000 903f
```

1. 首先`4d54 6864 0000 0006 0000 0001 0064`是上文介绍过的MThd部分。
2. `4d54 726b` 是MTrk的开头，也就是“MTrk”的ASCII编码。
3. `0000 03a9` 是MTrk数据部分的大小，这里转化为十进制是937。接下来就是937字节的数据。
4. `xxyy xxyyyy ... ...` xx代表了Delta-time，yy代表了真正的MIDI事件。这些MIDI事件才是音序器在播放MIDI文件时需要实时处理和发送的数据。
5. `00ff 2f00` 是Meta-event事件，表示此Track结束。



其中：

**Delta-time：**

时间差，表征着当前事件距离上一个事件有多长时间，单位为tick。音序器通过对MIDI Tick进行计数，判断是否该处理下一个MIDI事件。Delta-time使用**可变长度的格式**，最短1个字节，最长4个字节（最长可以表示0x0fffffff）。

具体来说，一个字节有 8 bit，将其最高位bit作为标志位设为0，剩下7 bit就可以表示 0~127。如果Delta-time值超过127，就将标志位设置为1，并且下一个字节用来继续表示Delta-time。只要当前字节标志位为 0，则表示可以结束读取Delta-time。

**MIDI事件**

包括：

	1. 实际需要发送的数据（音序器直接将数据发送出去）
 	2. meta-event事件（音序器修改自身的相关参数）



- 下表详细说明了不同的数据对应的不同Midi时间，其中x 表示音轨 ，取值为0~F，比如 90 表示按下第一轨的音符。参数表示在Midi事件后需要读取的参数有几个以及他们各自表示的含义，一半来说每个参数占一个字节。

<img src="https://upload-images.jianshu.io/upload_images/15561067-718b16b850a605f1.png?imageMogr2/auto-orient/strip|imageView2/2/w/974/format/webp" alt="img" style="zoom: 67%;" />

- 下表为不同的参数值与不同音符的对应关系

<img src="https://upload-images.jianshu.io/upload_images/15561067-e351e90a7404f5a3.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp" alt="img" style="zoom: 40%;" />



比如，在上文的例子中，MTrk头部及长度数据之后的Midi信息编码为：
`---- ---- ---- 00c0 0000 903c 5a00 903f`
`5a00 9043 5a00 9048 5a78 803f 0000 904b
5a78 ---- ---- ---- ---- ---- ---- ----`

部分解析如下：
`00 c0 00` ：时间差00，改变第一轨乐器，乐器号码为00
`00 90 3c 5a` ：时间差00，按下第一轨音符，音符号码为3c（60，C4，中央C），力度为5a（90）
`00 90 3f 5a` ：时间差00，按下第一轨音符，音符号码为3f（63，#D4），力度为5a（90）

`78 80 3f 00`：时间差78（120tick），松开第一轨音符，音符号码为3f（63，#D4），力度为5a（90）



最终Midi事件中包含的信息可以等价为：

![img](https://upload-images.jianshu.io/upload_images/15561067-6336522f977d3dce.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp)

