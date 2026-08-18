"""
Runs one document conversion against an already-running, persistent
`soffice --accept=socket:...` listener via the UNO API — invoked as a
lightweight per-conversion helper process using LibreOffice's own bundled
Python (which ships with the `uno`/`pyuno` modules pre-installed), so this
carries none of soffice's own heavy engine-startup path. That startup path
is exactly where the direct-spawn-per-request architecture was failing
consistently when launched from the Tauri app; talking to one persistent
engine over UNO instead avoids re-entering it per conversion.

Usage: python.exe uno_convert.py <port> <input_path> <output_path> <filter_name>
Prints "OK" and exits 0 on success; prints an error to stderr and exits
non-zero on failure (connection refused, load failure, export failure).
"""
import sys


def make_prop(uno, name, value):
    from com.sun.star.beans import PropertyValue
    p = PropertyValue()
    p.Name = name
    p.Value = value
    return p


def main():
    if len(sys.argv) != 5:
        print("usage: uno_convert.py <port> <input_path> <output_path> <filter_name>", file=sys.stderr)
        sys.exit(2)

    port, input_path, output_path, filter_name = sys.argv[1:5]

    import uno
    from com.sun.star.connection import NoConnectException

    local_context = uno.getComponentContext()
    resolver = local_context.ServiceManager.createInstanceWithContext(
        "com.sun.star.bridge.UnoUrlResolver", local_context
    )
    try:
        ctx = resolver.resolve(
            f"uno:socket,host=127.0.0.1,port={port};urp;StarOffice.ComponentContext"
        )
    except NoConnectException as e:
        print(f"CONNECTION_REFUSED: {e}", file=sys.stderr)
        sys.exit(3)

    smgr = ctx.ServiceManager
    desktop = smgr.createInstanceWithContext("com.sun.star.frame.Desktop", ctx)

    input_url = uno.systemPathToFileUrl(input_path)
    output_url = uno.systemPathToFileUrl(output_path)

    load_props = (make_prop(uno, "Hidden", True),)
    doc = desktop.loadComponentFromURL(input_url, "_blank", 0, load_props)
    if doc is None:
        print("LOAD_FAILED: loadComponentFromURL returned None", file=sys.stderr)
        sys.exit(1)

    try:
        store_props = (make_prop(uno, "FilterName", filter_name),)
        doc.storeToURL(output_url, store_props)
    except Exception as e:
        print(f"EXPORT_FAILED: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        doc.close(False)

    print("OK")


if __name__ == "__main__":
    main()
