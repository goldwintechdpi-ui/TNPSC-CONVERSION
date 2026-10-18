import struct

def build_pe():
    # 64-bit Windows PE GUI Executable
    # ImageBase: 0x140000000
    # .text at RVA 0x1000, File Offset 0x400
    # .rdata at RVA 0x2000, File Offset 0x600

    image_base = 0x140000000

    # We will import:
    # kernel32.dll -> WinExec, ExitProcess
    # shell32.dll -> ShellExecuteA

    # Layout in .rdata (RVA 0x2000):
    # 0x2000: Import Directory Table (3 entries of 20 bytes: kernel32, shell32, null terminator = 60 bytes)
    # 0x2040: ILT for kernel32 (2 QWORDs + null = 24 bytes)
    # 0x2060: IAT for kernel32 (2 QWORDs + null = 24 bytes)
    # 0x2080: ILT for shell32 (1 QWORD + null = 16 bytes)
    # 0x2090: IAT for shell32 (1 QWORD + null = 16 bytes)
    # 0x20B0: String "kernel32.dll\0"
    # 0x20C0: String "shell32.dll\0"
    # 0x20D0: Hint/Name "WinExec\0"
    # 0x20E0: Hint/Name "ExitProcess\0"
    # 0x20F0: Hint/Name "ShellExecuteA\0"
    # 0x2100: String "open\0"
    # 0x2110: Command string "python tamil_pdf_tool.py" OR Browser URL

    # Let's write the target URL / command
    # When user double clicks Tamil_PDF_Tool.exe on Windows, it will launch the app:
    url = "https://ais-dev-ytjqdrq33d6xoeipzuogid-927057575727.asia-east1.run.app"
    cmd = "python tamil_pdf_tool.py"

    # In .text (RVA 0x1000):
    # x86-64 code:
    # sub rsp, 0x38           (48 83 ec 38)
    # xor ecx, ecx            (31 c9)
    # lea rdx, [rip + 'open'] (48 8d 15 ...)
    # lea r8, [rip + url]     (48 8d 05 ...)
    # xor r9d, r9d            (45 31 c9)
    # mov qword [rsp + 0x20], 0 (48 c7 44 24 20 00 00 00 00)
    # mov dword [rsp + 0x28], 1 (c7 44 24 28 01 00 00 00)  ; SW_SHOWNORMAL = 1
    # call [rip + __imp_ShellExecuteA] (ff 15 ...)
    #
    # Also try WinExec("python tamil_pdf_tool.py", 1):
    # lea rcx, [rip + cmd]
    # mov edx, 1
    # call [rip + __imp_WinExec]
    #
    # xor ecx, ecx
    # call [rip + __imp_ExitProcess]

    rdata_rva = 0x2000
    rdata_buf = bytearray(0x400)

    # Offsets inside .rdata
    off_idt = 0x00
    off_ilt_k32 = 0x40
    off_iat_k32 = 0x60
    off_ilt_sh32 = 0x80
    off_iat_sh32 = 0xa0

    off_str_k32 = 0xc0
    off_str_sh32 = 0xd0
    off_hn_winexec = 0xe0
    off_hn_exitproc = 0xf0
    off_hn_shellexec = 0x100
    off_str_open = 0x120
    off_str_cmd = 0x130
    off_str_url = 0x160

    # Write strings
    def put_str(offset, s):
        data = s.encode('ascii') + b'\0'
        rdata_buf[offset:offset+len(data)] = data

    put_str(off_str_k32, "KERNEL32.dll")
    put_str(off_str_sh32, "SHELL32.dll")
    
    # Hint/name tables (2 bytes hint + name + null)
    rdata_buf[off_hn_winexec+2:off_hn_winexec+2+len(b"WinExec\0")] = b"WinExec\0"
    rdata_buf[off_hn_exitproc+2:off_hn_exitproc+2+len(b"ExitProcess\0")] = b"ExitProcess\0"
    rdata_buf[off_hn_shellexec+2:off_hn_shellexec+2+len(b"ShellExecuteA\0")] = b"ShellExecuteA\0"

    put_str(off_str_open, "open")
    put_str(off_str_cmd, cmd)
    put_str(off_str_url, url)

    # ILT and IAT for Kernel32
    # Entry 0: WinExec
    # Entry 1: ExitProcess
    # Entry 2: 0 (null terminator)
    for off in (off_ilt_k32, off_iat_k32):
        struct.pack_into("<QQQ", rdata_buf, off, 
                         rdata_rva + off_hn_winexec,
                         rdata_rva + off_hn_exitproc,
                         0)

    # ILT and IAT for Shell32
    # Entry 0: ShellExecuteA
    # Entry 1: 0 (null terminator)
    for off in (off_ilt_sh32, off_iat_sh32):
        struct.pack_into("<QQ", rdata_buf, off,
                         rdata_rva + off_hn_shellexec,
                         0)

    # IDT entries (20 bytes each)
    # Entry 0: KERNEL32
    struct.pack_into("<IIIII", rdata_buf, off_idt,
                     rdata_rva + off_ilt_k32,   # OriginalFirstThunk (ILT)
                     0,                         # TimeDateStamp
                     0,                         # ForwarderChain
                     rdata_rva + off_str_k32,   # Name RVA
                     rdata_rva + off_iat_k32    # FirstThunk (IAT)
    )

    # Entry 1: SHELL32
    struct.pack_into("<IIIII", rdata_buf, off_idt + 20,
                     rdata_rva + off_ilt_sh32,  # OriginalFirstThunk (ILT)
                     0,                         # TimeDateStamp
                     0,                         # ForwarderChain
                     rdata_rva + off_str_sh32,  # Name RVA
                     rdata_rva + off_iat_sh32   # FirstThunk (IAT)
    )

    # Entry 2: Null terminator (20 bytes zero)

    # Now construct .text code (RVA 0x1000)
    # Let's write the code instructions:
    code = bytearray()
    
    # sub rsp, 0x38 (allocate shadow space + alignment)
    code += bytes([0x48, 0x83, 0xEC, 0x38])

    # Try ShellExecuteA(0, "open", url, 0, 0, 1)
    # rcx = 0
    code += bytes([0x48, 0x31, 0xC9])

    # rdx = &"open" -> rdata_rva + off_str_open
    # In RIP-relative: target - (current_ip + 7)
    # We will patch RIP-relative offsets
    
    # Let's define helper to emit RIP-relative LEA: lea reg64, [rip + rva]
    # instruction: 48 8d <modrm> <disp32>
    def emit_lea_rip(reg_num, target_rva):
        nonlocal code
        curr_offset = len(code)
        # modrm: 00 <reg:3> 101 (rip-relative)
        modrm = (reg_num << 3) | 0x05
        code += bytes([0x48, 0x8D, modrm, 0x00, 0x00, 0x00, 0x00])
        # disp32 = target_rva - (0x1000 + len(code))
        disp32 = target_rva - (0x1000 + len(code))
        struct.pack_into("<i", code, curr_offset + 3, disp32)

    # rdx (reg 2) = "open"
    emit_lea_rip(2, rdata_rva + off_str_open)

    # r8 (reg 0 with REX.B=1 -> 49 8D 05 disp32)
    def emit_lea_r8_rip(target_rva):
        nonlocal code
        curr_offset = len(code)
        code += bytes([0x4C, 0x8D, 0x05, 0x00, 0x00, 0x00, 0x00])
        disp32 = target_rva - (0x1000 + len(code))
        struct.pack_into("<i", code, curr_offset + 3, disp32)

    emit_lea_r8_rip(rdata_rva + off_str_url)

    # r9d = 0 (45 31 C9)
    code += bytes([0x45, 0x31, 0xC9])

    # mov qword [rsp + 0x20], 0
    code += bytes([0x48, 0xC7, 0x44, 0x24, 0x20, 0x00, 0x00, 0x00, 0x00])

    # mov dword [rsp + 0x28], 1 (SW_SHOWNORMAL)
    code += bytes([0xC7, 0x44, 0x24, 0x28, 0x01, 0x00, 0x00, 0x00])

    # call [rip + IAT_ShellExecuteA]
    # FF 15 disp32
    def emit_call_rip_ptr(target_rva):
        nonlocal code
        curr_offset = len(code)
        code += bytes([0xFF, 0x15, 0x00, 0x00, 0x00, 0x00])
        disp32 = target_rva - (0x1000 + len(code))
        struct.pack_into("<i", code, curr_offset + 2, disp32)

    emit_call_rip_ptr(rdata_rva + off_iat_sh32)

    # Now also try WinExec("python tamil_pdf_tool.py", 1) in case local python exists
    # rcx = &cmd
    emit_lea_rip(1, rdata_rva + off_str_cmd)
    # edx = 1 (BA 01 00 00 00)
    code += bytes([0xBA, 0x01, 0x00, 0x00, 0x00])
    emit_call_rip_ptr(rdata_rva + off_iat_k32)

    # ExitProcess(0)
    # ecx = 0
    code += bytes([0x31, 0xC9])
    # call [rip + IAT_ExitProcess] (offset 8 in IAT_K32)
    emit_call_rip_ptr(rdata_rva + off_iat_k32 + 8)

    text_buf = bytearray(0x200)
    text_buf[:len(code)] = code

    # Headers
    # DOS Header (64 bytes)
    dos_header = bytearray(64)
    dos_header[0:2] = b"MZ"
    struct.pack_into("<H", dos_header, 0x3C, 0x80)  # e_lfanew = 0x80

    # DOS Stub (64 bytes from 0x40 to 0x80)
    dos_stub = bytes([
        0x0E, 0x1F, 0xBA, 0x0E, 0x00, 0xB4, 0x09, 0xCD, 0x21, 0xB8, 0x01, 0x4C, 0xCD, 0x21,
        0x54, 0x68, 0x69, 0x73, 0x20, 0x70, 0x72, 0x6F, 0x67, 0x72, 0x61, 0x6D, 0x20, 0x63,
        0x61, 0x6E, 0x6E, 0x6F, 0x74, 0x20, 0x62, 0x65, 0x20, 0x72, 0x75, 0x6E, 0x20, 0x69,
        0x6E, 0x20, 0x44, 0x4F, 0x53, 0x20, 0x6D, 0x6F, 0x64, 0x65, 0x2E, 0x0D, 0x0D, 0x0A,
        0x24, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ])

    # PE Signature (4 bytes)
    pe_sig = b"PE\0\0"

    # COFF File Header (20 bytes)
    # Machine: 0x8664 (AMD64)
    # NumberOfSections: 2
    # TimeDateStamp: 0
    # PointerToSymbolTable: 0
    # NumberOfSymbols: 0
    # SizeOfOptionalHeader: 240 (0xF0)
    # Characteristics: 0x0022 (IMAGE_FILE_EXECUTABLE_IMAGE | IMAGE_FILE_LARGE_ADDRESS_AWARE)
    coff_header = struct.pack("<HHIIIHH", 0x8664, 2, 0, 0, 0, 240, 0x0022)

    # Optional Header (PE32+, 240 bytes)
    # Magic: 0x020B
    # MajorLinkerVersion: 14, MinorLinkerVersion: 0
    # SizeOfCode: 0x200
    # SizeOfInitializedData: 0x400
    # SizeOfUninitializedData: 0
    # AddressOfEntryPoint: 0x1000 (.text RVA)
    # BaseOfCode: 0x1000
    # ImageBase: 0x140000000
    # SectionAlignment: 0x1000
    # FileAlignment: 0x200
    # MajorOperatingSystemVersion: 6, MinorOperatingSystemVersion: 0
    # MajorImageVersion: 1, MinorImageVersion: 0
    # MajorSubsystemVersion: 6, MinorSubsystemVersion: 0
    # Win32VersionValue: 0
    # SizeOfImage: 0x3000
    # SizeOfHeaders: 0x400
    # CheckSum: 0
    # Subsystem: 2 (IMAGE_SUBSYSTEM_WINDOWS_GUI)
    # DllCharacteristics: 0x8160 (DYNAMIC_BASE | NX_COMPAT | TERMINAL_SERVER_AWARE)
    # SizeOfStackReserve: 0x100000, SizeOfStackCommit: 0x1000
    # SizeOfHeapReserve: 0x100000, SizeOfHeapCommit: 0x1000
    # LoaderFlags: 0
    # NumberOfRvaAndSizes: 16
    opt_standard = struct.pack("<HBBIIIII", 0x020B, 14, 0, 0x200, 0x400, 0, 0x1000, 0x1000)
    opt_windows = struct.pack("<QIIHHHHHHIIIIHHQQQQII",
        image_base,     # ImageBase
        0x1000,         # SectionAlignment
        0x200,          # FileAlignment
        6, 0,           # OS Version 6.0
        1, 0,           # Image Version 1.0
        6, 0,           # Subsystem Version 6.0
        0,              # Win32Version
        0x3000,         # SizeOfImage
        0x400,          # SizeOfHeaders
        0,              # CheckSum
        2,              # Subsystem: WINDOWS_GUI
        0x8160,         # DllCharacteristics
        0x100000, 0x1000, # Stack
        0x100000, 0x1000, # Heap
        0,              # LoaderFlags
        16              # NumberOfRvaAndSizes
    )

    # Data Directories (16 entries of 8 bytes: VirtualAddress, Size)
    data_dirs = bytearray(16 * 8)
    # Directory 1: Import Table (RVA 0x2000, Size = 40 bytes)
    struct.pack_into("<II", data_dirs, 1 * 8, rdata_rva, 60)
    # Directory 12: IAT (RVA 0x2060, Size = 24 + 16 = 40 bytes)
    struct.pack_into("<II", data_dirs, 12 * 8, rdata_rva + off_iat_k32, 40)

    optional_header = opt_standard + opt_windows + data_dirs

    # Section Headers (40 bytes each)
    # Section 1: .text
    # Name: b".text\0\0\0"
    # VirtualSize: 0x200, VirtualAddress: 0x1000
    # SizeOfRawData: 0x200, PointerToRawData: 0x400
    # PointerToRelocations: 0, PointerToLinenumbers: 0
    # NumberOfRelocations: 0, NumberOfLinenumbers: 0
    # Characteristics: 0x60000020 (CODE | EXECUTE | READ)
    sec_text = struct.pack("<8sIIIIIIHHI", b".text\0\0\0", 0x200, 0x1000, 0x200, 0x400, 0, 0, 0, 0, 0x60000020)

    # Section 2: .rdata
    # Characteristics: 0x40000040 (INITIALIZED_DATA | READ)
    sec_rdata = struct.pack("<8sIIIIIIHHI", b".rdata\0\0", 0x400, 0x2000, 0x400, 0x600, 0, 0, 0, 0, 0x40000040)

    # Combine Headers (pad to 0x400)
    headers = bytearray(0x400)
    headers[0:64] = dos_header
    headers[64:128] = dos_stub
    pe_offset = 0x80
    headers[pe_offset:pe_offset+4] = pe_sig
    headers[pe_offset+4:pe_offset+24] = coff_header
    headers[pe_offset+24:pe_offset+24+240] = optional_header
    headers[pe_offset+264:pe_offset+264+40] = sec_text
    headers[pe_offset+304:pe_offset+304+40] = sec_rdata

    # Final PE Binary:
    # 0x000 - 0x3FF: Headers (0x400 bytes)
    # 0x400 - 0x5FF: .text (0x200 bytes)
    # 0x600 - 0x9FF: .rdata (0x400 bytes)
    pe_file = headers + text_buf + rdata_buf

    with open("./public/Tamil_PDF_Tool.exe", "wb") as f:
        f.write(pe_file)

    print(f"Successfully generated ./public/Tamil_PDF_Tool.exe ({len(pe_file)} bytes)")

if __name__ == "__main__":
    build_pe()
