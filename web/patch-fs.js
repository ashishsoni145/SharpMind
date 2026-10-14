// Patch Node.js fs.readlink on FAT32 filesystems on Windows
// On Windows FAT32, fs.readlink on a regular file throws EISDIR instead of EINVAL.
// Webpack / enhanced-resolve expects EINVAL when checking if a path is a symlink.
const fs = require('fs');
const path = require('path');

function patchFs() {
  const origReadlink = fs.readlink;
  const origReadlinkSync = fs.readlinkSync;

  fs.readlink = function (pathArg, options, callback) {
    const cb = typeof options === 'function' ? options : callback;
    const opt = typeof options === 'function' ? undefined : options;
    return origReadlink.call(fs, pathArg, opt, (err, linkString) => {
      if (err && (err.code === 'EISDIR' || (err.message && err.message.includes('EISDIR')))) {
        const newErr = new Error(`EINVAL: invalid argument, readlink '${pathArg}'`);
        newErr.code = 'EINVAL';
        newErr.errno = -4071;
        newErr.syscall = 'readlink';
        newErr.path = pathArg;
        return cb(newErr);
      }
      return cb(err, linkString);
    });
  };

  fs.readlinkSync = function (pathArg, options) {
    try {
      return origReadlinkSync.call(fs, pathArg, options);
    } catch (err) {
      if (err && (err.code === 'EISDIR' || (err.message && err.message.includes('EISDIR')))) {
        const newErr = new Error(`EINVAL: invalid argument, readlink '${pathArg}'`);
        newErr.code = 'EINVAL';
        newErr.errno = -4071;
        newErr.syscall = 'readlink';
        newErr.path = pathArg;
        throw newErr;
      }
      throw err;
    }
  };

  if (fs.promises && fs.promises.readlink) {
    const origPromisesReadlink = fs.promises.readlink;
    fs.promises.readlink = async function (pathArg, options) {
      try {
        return await origPromisesReadlink.call(fs.promises, pathArg, options);
      } catch (err) {
        if (err && (err.code === 'EISDIR' || err.message.includes('EISDIR'))) {
          const newErr = new Error(`EINVAL: invalid argument, readlink '${pathArg}'`);
          newErr.code = 'EINVAL';
          newErr.errno = -4071;
          newErr.syscall = 'readlink';
          newErr.path = pathArg;
          throw newErr;
        }
        throw err;
      }
    };
  }

  // On Windows (e.g. OneDrive reparse points or non-symlink junctions), libuv flags
  // reparse points as UV_DIRENT_LINK. This causes Next.js recursiveDelete to treat
  // directories as symlinks and fail with EINVAL when calling readlink on them.
  if (process.platform === 'win32' && fs.Dirent && fs.Dirent.prototype) {
    const origIsSymlink = fs.Dirent.prototype.isSymbolicLink;
    const origIsDir = fs.Dirent.prototype.isDirectory;
    const origIsFile = fs.Dirent.prototype.isFile;

    fs.Dirent.prototype.isSymbolicLink = function () {
      const isSym = origIsSymlink.call(this);
      if (!isSym) return false;
      try {
        const dir = this.parentPath || this.path || '';
        const fullPath = dir ? path.join(dir, this.name) : this.name;
        return fs.lstatSync(fullPath).isSymbolicLink();
      } catch {
        return false;
      }
    };

    fs.Dirent.prototype.isDirectory = function () {
      if (origIsDir.call(this)) return true;
      try {
        const dir = this.parentPath || this.path || '';
        const fullPath = dir ? path.join(dir, this.name) : this.name;
        return fs.statSync(fullPath).isDirectory();
      } catch {
        return false;
      }
    };

    fs.Dirent.prototype.isFile = function () {
      if (origIsFile.call(this)) return true;
      try {
        const dir = this.parentPath || this.path || '';
        const fullPath = dir ? path.join(dir, this.name) : this.name;
        return fs.statSync(fullPath).isFile();
      } catch {
        return false;
      }
    };
  }
}

patchFs();
